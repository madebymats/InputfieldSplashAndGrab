$(document).ready(function () {

	let totalHits,
        totalPages,
        perPage,
        moduleConfig = config.InputfieldSplashAndGrab, // Config settings as defined by PageListPermissions.module
        apiKey = moduleConfig.settings.apiKey;

    const $maxFiles = [],
          $uploadedFiles = [],
          $results = [],
          $chosen = [],
          chosenColor = [],
          chosenOrientation = [],
          chosenOrder = [],
          startPage = [];


    $('.unsplashSearch').val($("#Inputfield_title").val());
    $numGridImg = $(".gridImages .gridImage:not('.gridImage--delete')").length;
    $('.unsplashButton').on('click', function (e) {


        e.preventDefault()
        parent_sag = $(this).closest('.unsplash');
        field_name = parent_sag.data('name');
        field_id = parent_sag.data('fieldid');

        //reset pager to defautl values
        chosenOrientation[field_id] = undefined;
        chosenColor[field_id] = undefined;
        chosenOrder[field_id] = undefined;

        page_id = parent_sag.data('id');
        $maxFiles[field_id] = $("#splashAndGrab_" + field_id).data('maxfiles');
        $uploadedFiles[field_id] = $("#splashAndGrab_" + field_id).data('uploadedfiles');
        sizesFound = 0;
        descsFound = 0;
        $results[field_id] = $('#unsplashResults_'+field_id);
        $resultItems = $('.resultsItems');
        $chosen[field_id] = $('#unsplashChosen_'+field_id);
        $results[field_id].html('');
        $results[field_id].addClass('unsplashLoading');

        let query = $('#unsplashMagic_'+field_id).val();
        $button = $(this);
        getImages(query, undefined, undefined, undefined, undefined, undefined, field_id);
        return false;
    });
    var sortValues = ['relevant', 'latest'];
    var orientation = ['landscape', 'portrait', 'squarish'];
    var colors = ['black_and_white', 'black', 'white', 'yellow', 'orange', 'red', 'purple', 'magenta', 'green', 'teal', 'blue'];
    function getImages(searchterm, page = 1, per_page = 15, order, color, orientation, fid) {
        
        $.getJSON("https://api.unsplash.com/search/photos",
            {
                client_id: apiKey,
                query: searchterm,
                page: page,
                per_page: per_page,
                order_by: order,
                color: color,
                orientation: orientation                  
            },
            function (data) {

                totalHits = data.total;
                totalPages = data.total_pages;
                perPage = per_page;

                $results[fid].children().remove();

                if (data.results.length == 0) {
                   noHits(fid);
                } 
                
                renderPager(fid);
               
                $.each(data.results, function (item) {
                    let itemNo = data.results[item];
                    renderImage(itemNo,fid);
                });

                $("#numSelected_"+fid).html($("#unsplashChosen_"+fid+" .selected").length);
            });
    }

    function noHits(fid){
        $sorryString = moduleConfig.i18n.noHits;
        $results[fid].html($sorryString);
    }


    $("fieldset.unsplash").each(function(key, val) {
        let refid = $(val).attr("data-fieldid");

        $("body").on("change", "#unsplashOriantation_"+refid,function(){
            let query = $("#unsplashMagic_"+refid).val();
            chosenOrientation[refid] = this.value;
            if (!chosenOrientation[refid]) chosenOrientation[refid] = undefined; 
            startPage[refid] = 1;
            getImages(query, startPage[refid], perPage, chosenOrder[refid], chosenColor[refid], chosenOrientation[refid], refid);
        });

        $("body").on("change", "#unsplashColor_"+refid, function () {
            let query = $("#unsplashMagic_"+refid).val();
            chosenColor[refid] = this.value;
            if (!chosenColor[refid]) chosenColor[refid] = undefined; 
            startPage[refid] = 1;
            getImages(query, startPage[refid], perPage, chosenOrder[refid], chosenColor[refid], chosenOrientation[refid], refid);
        });

        $("body").on("change", "#unsplashOrder_"+refid, function () {
            let query = $("#unsplashMagic_"+refid).val();
            chosenOrder[refid] = this.value;
            if (!chosenOrder[refid]) chosenOrder[refid] = undefined;
            startPage[refid] = 1;
            getImages(query, startPage[refid], perPage, chosenOrder[refid], chosenColor[refid], chosenOrientation[refid], refid);
        });

        $("body").on("click", "#nextPager_"+refid, function(event){
            event.preventDefault();
            let query = $("#unsplashMagic_"+refid).val();
            startPage[refid]++;
            getImages(query, startPage[refid], perPage, chosenOrder[refid], chosenColor[refid], chosenOrientation[refid], refid);
        });

        $("body").on("click", "#prevPager_"+refid, function (event) {
            event.preventDefault();
            let query = $("#unsplashMagic_"+refid).val();
            startPage[refid]--;
            getImages(query, startPage[refid], perPage, chosenOrder[refid], chosenColor[refid], chosenOrientation[refid], refid);
        });

        $(document).on("click", "#numSelected_"+refid, function(){
            $("#unsplashChosen_"+refid).toggle();
        })

        window.addEventListener("beforeunload", function () {
            $("#unsplashChosen_"+refid).children().each(function(){
                $.ajax({
                    type: 'GET',
                    async: true,
                    url: $(this).data("download") + '?client_id=' + apiKey,
                });
                
            })
            sessionStorage.clear();
        });        
    });


    function addToLocalstorage(img) {
        sessionStorage.setItem(img, img);
    }

    function removeLocalstorageItem(img) {
        sessionStorage.removeItem(img)
    }

    function renderColorSelect(fid){
        let options;
        for (let index = 0; index < colors.length; index++) {

            let configIndex = colors[index];
            let selected = chosenColor[fid] == configIndex ? "selected" : "";
            options += "<option " + selected + " value='" + configIndex + "'>" + moduleConfig.i18n[configIndex] + "</option>";
        }
        $colorsOut = `
        <select class="uk-select" id="unsplashColor_${fid}">
        <option value="">${moduleConfig.i18n.colors}</option>
        ${ options }
         </select >
        `;

        return $colorsOut;
    }

    function renderOrientationSelect(fid){
        let options = "";
        for (let index = 0; index < orientation.length; index++) {

            let configIndex = orientation[index];
            let selected = chosenOrientation[fid] == configIndex ? "selected" : "";
            options += "<option " + selected + " value='" + configIndex + "'>" + moduleConfig.i18n[configIndex] + "</option>";
        }
        let optionsOut = `
        <select id="unsplashOriantation_${fid}" class="uk-select">
            <option value="">${moduleConfig.i18n.orientaions}</option>
            ${options}
        </select>`;

        return optionsOut;
    }

    function renderOrderSelect(fid){
        let options = "";
        for (let index = 0; index < sortValues.length; index++) {

            let configIndex = sortValues[index];
            let selected = chosenOrder[fid] == configIndex ? "selected" : "";
            options += "<option " + selected + " value='" + configIndex + "'>" + moduleConfig.i18n[configIndex] + "</option>";
        }
        let orderOut = `
        <select id="unsplashOrder_${fid}" class="uk-select">
            ${options}
        </select>`;

        return orderOut;
    }

    function renderPager(fid){
        let disablePrev = startPage[fid] < 2 ? "disabled" : "" ;
        let disableNext = totalPages == startPage[fid] ? "disabled" : "";
        
        $("#numSelected").html();
        let pager = `
        <div class="uk-margin">
            <button ${disablePrev} id="prevPager_${fid}" class="uk-button uk-button-primary uk-button-small">
            <span uk-icon='icon: chevron-left'></span></button>
            <button ${disableNext} id="nextPager_${fid}" class="uk-button uk-button-primary uk-button-small">
                <span uk-icon='icon: chevron-right'></span>
            </button>
            <span class="uk-margin-left uk-text-small">${moduleConfig.i18n.numberOfSelects}: </span><span id="numSelected" class="uk-button uk-button-primary uk-button-small"></span><span class="uk-margin-small-left" title="${moduleConfig.i18n.title_numoffiles}">${moduleConfig.i18n.of} ${$maxFiles[fid]}</span>
            ${renderOrientationSelect(fid)}
            ${renderColorSelect(fid)}
            ${renderOrderSelect(fid)}
            <span>${moduleConfig.i18n.totalhitsstring}: ${totalHits}  </span>
            </div>`;
        $(pager).prependTo($results[fid]);
    }

    
    $(".gridImages").on("click", ".gridImage, .gridImage--delete", function(){
        setTimeout(() => {
            $numGridImg = $(".gridImages .gridImage:not('.gridImage--delete')").length;
        }, 100);
    });
    
    function shake(thing) {
        var interval = 100;
        var distance = 10;
        var times = 6;

        for (var i = 0; i < (times + 1); i++) {
            $(thing).animate({
                left:
                    (i % 2 == 0 ? distance : distance * -1)
            }, interval);
        }
        $(thing).animate({
            left: 0,
            top: 0
        }, interval);
    }

    
    function renderImage(item, fid) {
        let firstName = item.user.first_name;
        let lastName = item.user.last_name ? " " + item.user.last_name : "";
        let photographer = firstName + lastName;
        let selected = sessionStorage.getItem(item.id) == item.id ? "selected" : "" ; 
        let userUrl = item.user.links.html + "?utm_source=inputfieldSmashAndGrab&utm_medium=referral "; 
        $("<div data-uid='" + item.id + "' class='fImage gridImg " + selected + "' style='background-image: url(" + item.urls.small + ")'>"
            + "<a target='_blank' href='" + userUrl + "'><div class='userData'><img src='" + item.user.profile_image.medium + "'><p>" + photographer + "</p></div></a></div>")
           
            .appendTo($results[fid])
            .on("click", function (e) {
                $target = $(e.target);
                if ($("#unsplashChosen_"+fid+" .selected").length >= $maxFiles[fid] - $numGridImg && !$target.hasClass("selected")){
                    console.log("waz up");
                    shake($(this));
                    return
                }
                $target = $(e.target);
                if ( $target.hasClass("userData") || $target.parent().hasClass("userData") ){
                    return;
                }

                if (!$target.hasClass("selected")) {
                    renderSelected(item,fid);
                    $(e.currentTarget).addClass("selected");
                    addToLocalstorage(item.id);
                    $("#numSelected").html($("#unsplashChosen_"+fid+" .selected").length);
                    $("#unsplashChosen_"+fid).show();
                } else {
                    $("#unsplashChosen_"+fid+" .selected[data-uid='" + item.id + "']").remove();
                    $(e.currentTarget).removeClass("selected");
                    removeLocalstorageItem(item.id);
                    $("#numSelected").html($("#unsplashChosen_"+fid+" .selected").length);
                }
            
            });
       
    }

    //TODO build download link parameters based on image field settings

    function renderSelected(pic,fid) {
        let firstName = pic.user.first_name;
        let lastName = pic.user.last_name ? " " + pic.user.last_name : "";
        let photographer = firstName + lastName;
        let description = pic.description ? pic.description : pic.alt_description;
        let downloadUrl = moduleConfig.settings.maxWidth ? pic.urls.raw + "&w=" + moduleConfig.settings.maxWidth : pic.urls.regular ;
        $("<div data-download='" + pic.links.download_location + "' data-uid='" + pic.id + "' class='picked fImage selected' style='background-image: url(" + pic.urls.small + ")'>"
            + "<input multiple id='id-" + page_id + "-" + pic.id + "' type='hidden' name='unsplash_" + field_name + "*" + field_name + "*" + page_id + "*[]' value='" + downloadUrl + "*" + description + ". " + moduleConfig.i18n.photo_by + " " + photographer + ", Unsplash.' />"
            +"<span class='uk-text-primary' uk-icon='icon: check'></span>"
            +"</div>")
        .appendTo($chosen[fid])
            .on("click", function (e) {
                $target = $(e.target);
                $(".gridImg[data-uid='" + pic.id + "']").first().removeClass("selected");
                $target.remove();
                removeLocalstorageItem(pic.id);
            });
    }

}); 