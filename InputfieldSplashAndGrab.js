$(document).ready(function () {

    let apiKey = "TXtTckxpjGAtu33DZ712disnUcTMpMqR-AdPepgS0pU",
        startPage = 1,
        totalHits,
        totalPages,
        perPage,
        chosenOrientation,
        chosenColor,
        chosenOrder,
        moduleConfig = config.InputfieldSplashAndGrab; // Config settings as defined by PageListPermissions.module

    $('.unsplashSearch').val($("#Inputfield_title").val());
    $numGridImg = $(".gridImages .gridImage:not('.gridImage--delete')").length;
    $('.unsplashButton').on('click', function (e) {

        //reset pager to defautl values
        chosenOrientation = undefined;
        chosenColor = undefined;
        chosenOrder = undefined;

        e.preventDefault()
        $maxFiles = $("#splashAndGrab").data('maxfiles');
        $uploadedFiles = $("#splashAndGrab").data('uploadedfiles');
        sizesFound = 0;
        descsFound = 0;
        $results = $('.unsplashResults');
        $resultItems = $('.resultsItems');
        $chosen = $('.unsplashChosen');
        $results.html('');
        field_name = $("#splashAndGrab").data('name');
        page_id = $("#splashAndGrab").data('id');
        $results.addClass('unsplashLoading');
        

        let query = $('#unsplashMagic').val();
        $button = $(this);
        getImages(query);
        return false;
    });
    var sortValues = ['relevant', 'latest'];
    var orientation = ['landscape', 'portrait', 'squarish'];
    var colors = ['black_and_white', 'black', 'white', 'yellow', 'orange', 'red', 'purple', 'magenta', 'green', 'teal', 'blue'];
    function getImages(searchterm, page = 1, per_page = 15, order, color, orientation) {
        
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

                $results.children().remove();

                if (data.results.length == 0) {
                   noHits();
                } 
                
                renderPager();
               
                $.each(data.results, function (item) {
                    let itemNo = data.results[item];
                    renderImage(itemNo);
                });

                $("#numSelected").html($(".unsplashChosen .selected").length);
            });
    }

    function noHits(){
        $sorryString = moduleConfig.i18n.noHits;
        $results.html($sorryString);
    }

    $("body").on("change", "#unsplashOriantation",function(){
        let query = $("#unsplashMagic").val();
        chosenOrientation = this.value;
        if (!chosenOrientation) chosenOrientation = undefined; 
        startPage = 1;
        getImages(query, startPage, perPage, chosenOrder, chosenColor, chosenOrientation);
    });

    $("body").on("change", "#unsplashColor", function () {
        let query = $("#unsplashMagic").val();
        chosenColor = this.value;
        if (!chosenColor) chosenColor = undefined; 
        startPage = 1;
        getImages(query, startPage, perPage, chosenOrder, chosenColor, chosenOrientation);
    });

    $("body").on("change", "#unsplashOrder", function () {
        let query = $("#unsplashMagic").val();
        chosenOrder = this.value;
        if (!chosenOrder) chosenOrder = undefined;
        startPage = 1;
        getImages(query, startPage, perPage, chosenOrder, chosenColor, chosenOrientation);
    });

    $("body").on("click", "#nextPager", function(event){
        event.preventDefault();
        let query = $("#unsplashMagic").val();
        startPage++;
        getImages(query, startPage, perPage, chosenOrder, chosenColor, chosenOrientation);
    });

    $("body").on("click", "#prevPager", function (event) {
        event.preventDefault();
        let query = $("#unsplashMagic").val();
        startPage--;
        getImages(query, startPage, perPage, chosenOrder, chosenColor, chosenOrientation);
    });

    $(document).on("click", "#numSelected", function(){
        $(".unsplashChosen").toggle();
    })

    function addToLocalstorage(img) {
        sessionStorage.setItem(img, img);
    }

    function removeLocalstorageItem(img) {
        sessionStorage.removeItem(img)
    }

    function renderColorSelect(){
        let options;
        for (let index = 0; index < colors.length; index++) {

            let configIndex = colors[index];
            let selected = chosenColor == configIndex ? "selected" : "";
            options += "<option " + selected + " value='" + configIndex + "'>" + moduleConfig.i18n[configIndex] + "</option>";
        }
        $colorsOut = `
        <select class="uk-select" id="unsplashColor">
        <option value="">${moduleConfig.i18n.colors}</option>
        ${ options }
         </select >
        `;

        return $colorsOut;
    }

    function renderOrientationSelect(){
        let options = "";
        for (let index = 0; index < orientation.length; index++) {

            let configIndex = orientation[index];
            let selected = chosenOrientation == configIndex ? "selected" : "";
            options += "<option " + selected + " value='" + configIndex + "'>" + moduleConfig.i18n[configIndex] + "</option>";
        }
        let optionsOut = `
        <select id="unsplashOriantation" class="uk-select">
            <option value="">${moduleConfig.i18n.orientaions}</option>
            ${options}
        </select>`;

        return optionsOut;
    }

    function renderOrderSelect(){
        let options = "";
        for (let index = 0; index < sortValues.length; index++) {

            let configIndex = sortValues[index];
            let selected = chosenOrder == configIndex ? "selected" : "";
            options += "<option " + selected + " value='" + configIndex + "'>" + moduleConfig.i18n[configIndex] + "</option>";
        }
        let orderOut = `
        <select id="unsplashOrder" class="uk-select">
            ${options}
        </select>`;

        return orderOut;
    }

    function renderPager(){
        let disablePrev = startPage < 2 ? "disabled" : "" ;
        let disableNext = totalPages == startPage ? "disabled" : "";
        
        $("#numSelected").html();
        let pager = `
        <div class="uk-margin">
            <button ${disablePrev} id="prevPager" class="uk-button uk-button-primary uk-button-small">
            <span uk-icon='icon: chevron-left'></span></button>
            <button ${disableNext} id="nextPager" class="uk-button uk-button-primary uk-button-small">
                <span uk-icon='icon: chevron-right'></span>
            </button>
            <span class="uk-margin-left uk-text-small">${moduleConfig.i18n.numberOfSelects}: </span><span id="numSelected" class="uk-button uk-button-primary uk-button-small"></span><span class="uk-margin-small-left" title="${moduleConfig.i18n.title_numoffiles}">${moduleConfig.i18n.of} ${$maxFiles}</span>
            ${renderOrientationSelect()}
            ${renderColorSelect()}
            ${renderOrderSelect()}
            <span>${moduleConfig.i18n.totalhitsstring}: ${totalHits}  </span>
            </div>`;
        $(pager).prependTo($results);
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

    
    function renderImage(item) {
        let firstName = item.user.first_name;
        let lastName = item.user.last_name ? " " + item.user.last_name : "";
        let photographer = firstName + lastName;
        let selected = sessionStorage.getItem(item.id) == item.id ? "selected" : "" ; 
        let userUrl = item.user.links.html + "?utm_source=inputfieldSmashAndGrab&utm_medium=referral "; 
        $("<div data-uid='" + item.id + "' class='fImage gridImg " + selected + "' style='background-image: url(" + item.urls.small + ")'>"
            + "<a target='_blank' href='" + userUrl + "'><div class='userData'><img src='" + item.user.profile_image.medium + "'><p>" + photographer + "</p></div></a></div>")
           
            .appendTo($results)
            .on("click", function (e) {
                $target = $(e.target);
                if ($(".unsplashChosen .selected").length >= $maxFiles - $numGridImg && !$target.hasClass("selected")){
                    console.log("waz up");
                    shake($(this));
                    return
                }
                $target = $(e.target);
                if ( $target.hasClass("userData") || $target.parent().hasClass("userData") ){
                    return;
                }

                if (!$target.hasClass("selected")) {
                    renderSelected(item);
                    $(e.currentTarget).addClass("selected");
                    addToLocalstorage(item.id);
                    $("#numSelected").html($(".unsplashChosen .selected").length);
                    $(".unsplashChosen").show();
                } else {
                    $(".unsplashChosen .selected[data-uid='" + item.id + "']").remove();
                    $(e.currentTarget).removeClass("selected");
                    removeLocalstorageItem(item.id);
                    $("#numSelected").html($(".unsplashChosen .selected").length);
                }
            
            });
       
    }

    //TODO build download link parameters based on image field settings

    function renderSelected(pic) {
        let firstName = pic.user.first_name;
        let lastName = pic.user.last_name ? " " + pic.user.last_name : "";
        let photographer = firstName + lastName;
        let description = pic.description ? pic.description : pic.alt_description;
        let downloadUrl = moduleConfig.settings.maxWidth ? pic.urls.raw + "&w=" + moduleConfig.settings.maxWidth : pic.urls.regular ;
        $("<div data-download='" + pic.links.download_location + "' data-uid='" + pic.id + "' class='picked fImage selected' style='background-image: url(" + pic.urls.small + ")'>"
            + "<input multiple id='id-" + page_id + "-" + pic.id + "' type='hidden' name='unsplash_" + field_name + "*" + field_name + "*" + page_id + "*[]' value='" + downloadUrl + "*" + description + ". " + moduleConfig.i18n.photo_by + " " + photographer + ", Unsplash.' />"
            +"<span class='uk-text-primary' uk-icon='icon: check'></span>"
            +"</div>")
        .appendTo($chosen)
            .on("click", function (e) {
                $target = $(e.target);
                $(".gridImg[data-uid='" + pic.id + "']").first().removeClass("selected");
                $target.remove();
                removeLocalstorageItem(pic.id);
            });
    }



    window.addEventListener("beforeunload", function () {
        $(".unsplashChosen").children().each(function(){
            $.ajax({
                type: 'GET',
                async: true,
                url: $(this).data("download") + '?client_id=' + apiKey,
            });
            
        })
        sessionStorage.clear();
    });
}); 