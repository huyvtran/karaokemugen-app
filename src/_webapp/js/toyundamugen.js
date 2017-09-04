var panel1Default;      // Int : default id of the playlist of the 1st panel (-1 means kara list)
var status;             // String : status of the player
var mode;               // String : way the kara list is constructed, atm "list" supported
var mouseDown;          // Boolean : capture if the mouse is pressed
var scope;              // String : if we're in public or admin interface
var refreshTime;        // Int (ms) : time unit between every call
var stopUpdate;         // Boolean : allow to stop any automatic ajax update
var oldState;           // Object : last player state saved
var oldSearchVal;       // String : previous search value
var ajaxSearch, timer;  // 2 variables used to optimize the search, preventing a flood of search
var pseudo;             // String : pseudo of the user
var bcTags;             // Object : list of blacklist criterias tags


var dragAndDrop;        // Boolean : allowing drag&drop
var karaParPage;        // Int : number of karas disaplyed per "page" (per chunk)
var toleranceDynamicPixels; // Int (px) : number of pixel before reaching the end of a playlist to trigger a new chunk of karas to be requested
var saveLastDetailsKara;    // Matrice saving the differents opened kara details to display them again when needed
var playlistToAdd;          // Int : id of playlist users are adding their kara to
var newKara;                // [Int] : for each playlist side, id of the new kara added
var socket;

/* promises */
var playlistsUpdating;
var playlistContentUpdating;

/* html */
var addKaraHtml;      
var deleteKaraHtml;
var deleteCriteriaHtml;
var transferKaraHtml;
var infoKaraHtml;
var buttonHtmlPublic;
var closeButton;
var closeButtonBottom;
var closePopupButton;
var showFullTextButton;
var dragHandleHtml;
var playKaraHtml;

var tabTradToDelete;

(function (yourcode) {
    yourcode(window.jQuery, window, document);
}(function ($, window, document) {
    $(function () {
        // Once page is loaded
        $.ajaxSetup({
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.status + "  - " + textStatus + "  - " + errorThrown + " : " + jqXHR.responseText);
                displayMessage('warning','Error', jqXHR.responseText);;
            }
        });

        $.ajax({ url: 'public/player' }).done(function (data) {
            refreshCommandStates(data);

            playlistToAdd = data['private'] == 1 ? "current" : "public";
            $.ajax({ url: 'public/playlists/' + playlistToAdd, }).done(function (data) {
                playlistAjoutId = data.playlist_id;
            });

        });

        initSwitchs();
        
        // méthode standard on attend 100ms après que la personne ait arrêté d'écrire, on abort toute requete de recherche en cours, et on lance la recherche
        $('#searchPlaylist1, #searchPlaylist2').on('input', function () {
            var num = $(this).attr('num');

            clearTimeout(timer);
            timer = setTimeout(function () {
                fillPlaylist(num);
            }, 100);
        }).keypress(function (e) { // allow pressing enter to validate a setting
            if (e.which == 13) {
                $(this).blur();
            }
        });
        
        /* // méthode cyclique, toutes les 300ms on vérifie si la valeur de recherche a changé et lance la recherche
         setInterval(function () {
             checkSearch();
         }, 300);*/

        /* when user selects a playlist */
        $("#selectPlaylist1, #selectPlaylist2").change(function (e) {
            var val = $(this).val();
            var isNew = $(this).find('[data-select2-tag="true"][value="' + val + '"]');
            if(isNew.length > 0) {
                e.preventDefault(); // si c'est une nouvelle entrée, le serveur nous dira quand elle sera crée
            } else {
                var num = $(this).attr('num');
                console.log(val, num);
                // prevent selecting 2 times the same playlist
                if (scope === "admin") {
                    $("select[type='playlist_select'][id!='selectPlaylist" + num + "'] > option").prop("disabled", false);
                    $("select[type='playlist_select'][id!='selectPlaylist" + num + "'] > option[value='" + val + "']").prop("disabled", true);
                }
                $("#playlist" + num).empty();
                $("#searchPlaylist" + num).val("");
                fillPlaylistSelects(true, num);
            }
        });

        /*  main actions on karas in the playlists */
        $('.playlist-main').on('click', '.btnDiv > button', function (e) {
            var li = $(this).closest('li');
            var num = $(this).closest('ul.list-group').attr('num');
            var idPlaylistFrom = parseInt($('#selectPlaylist' + num).val());
            var idPlaylistTo = parseInt($('#selectPlaylist' + non(num)).val());
            var idKara = li.attr('idkara');
            var idKaraPlaylist = li.attr('idplaylistcontent');
            var action = $(this).attr('name');
            console.log(action, num, idPlaylistFrom, idPlaylistTo, idKara);

            var url, data, type
            if (action === "addKara" || action === "transferKara") {
                url = "", data = {}, type = "";
                type = "POST";

                if (idPlaylistTo > 0) {
                    url = scope + (scope === "public" ? '/karas/' + idKara : '/playlists/' + idPlaylistTo + '/karas');
                    data = { requestedby: pseudo, kara_id: idKara }; // pos : 
                } else if (idPlaylistTo == -1) {
                    displayMessage('warning', 'Error',"can't add kara to the kara list from database");
                    console.log("ERR: can't add kara to the kara list from database");
                } else if (idPlaylistTo == -2) {
                    url = scope + '/blacklist/criterias'
                    data = { blcriteria_type: 1001, blcriteria_value: idKara };
                } else if (idPlaylistTo == -3) {
                    url = scope + '/whitelist';
                    data = { kara_id: idKara, reason: prompt("Raison d'ajout à la whitelist") };
                }

                console.log("ACTION : ", idPlaylistTo, url, type, data);
                if (url !== "") {
                    $.ajax({
                        url: url,
                        type: type,
                        data: data
                    }).done(function (data) {
                        //fillPlaylist(non(num), idKara);
                        playlistContentUpdating.done( function() {
                            scrollToKara(non(num), idKara); 
                        });
                        displayMessage('success', 'Success', "Kara added to playlist <i>" +$("#selectPlaylist" + non(num) + " > option[value='" + idPlaylistTo + "']").text() + "</i>.");
                        
                        console.log("Kara " + idKara + " ajouté à la playlist (" + idPlaylistTo + ") "
                            + $("#selectPlaylist" + non(num) + " > option[value='" + idPlaylistTo + "']").text() + ".");
                    }).fail(function (data) {
                        scrollToKara(non(num), idKara);
                    });
                }
            }
            if (action === "transferKara" || action === "deleteKara") {
                $(this).closest('li').fadeOut(500);
                url = "", data = {}, type = "";
                type = "DELETE"
                if (idPlaylistFrom > 0) {
                    url = scope + '/playlists/42/karas/' + idKaraPlaylist;
                } else if (idPlaylistFrom == -1) {
                    console.log("ERR: can't delete kara from the kara list from database");
                } else if (idPlaylistFrom == -2) {
                    console.log("ERR: can't delete kara directly from the blacklist");
                } else if (idPlaylistFrom == -3) {
                    url = scope + '/whitelist/' + idKara;
                }
                if (url !== "") {
                    $.ajax({
                        type: 'DELETE',
                        url: url
                    }).done(function (data) {
                        //fillPlaylist(num);
                    });
                }
            }
        });


        $('.playlist-main').on('click', '.infoDiv > button[name="infoKara"], .detailsKara > button.closeParent', function (e) {
            var liKara = $(this).closest('li');
            var idKara = parseInt(liKara.attr('idkara'));
            var idPlc = parseInt(liKara.attr('idplaylistcontent'));
            var idPlaylist = parseInt($('#selectPlaylist' + $(this).closest('ul').attr('num')).val());
            var infoKara = liKara.find('.detailsKara');

            if (infoKara.length == 0) {
                var urlInfoKara = idPlaylist > 0 ? scope + '/playlists/' + idPlaylist + '/karas/' + idPlc : 'public/karas/' + idKara;

                $.ajax({ url: urlInfoKara }).done(function (data) {
                    var detailsHtml = buildKaraDetails(data[0]);
                    detailsHtml = $(detailsHtml).hide()
                    liKara.append(detailsHtml);
                    detailsHtml.fadeIn(animTime);
                    liKara.find('[name="infoKara"]').css('border-color', '#8aa9af');
                    saveDetailsKara(idPlaylist, idKara, "add");
                });
            } else if (infoKara.is(':visible')) {
				saveDetailsKara(idPlaylist, idKara, "remove");
                infoKara.fadeOut(animTime);
                liKara.find('[name="infoKara"]').css('border-color', '');
            } else {
                saveDetailsKara(idPlaylist, idKara, "add");
                infoKara.fadeIn(animTime);
                liKara.find('[name="infoKara"]').css('border-color', '#8aa9af');
            }
        });

        $('.playlist-main').on('click', '.fullLyrics', function (e) {
            var playlist = $(this).closest('ul');
            var liKara = $(this).closest('li');
            var idKara = liKara.attr('idkara');
            var detailsKara = liKara.find('.detailsKara');

            $.ajax({ url: 'public/karas/' + idKara + '/lyrics' }).done(function (data) {
                liKara.append("<div class='lyricsKara alert alert-info'>" + closeButton + data.join('<br/>') + closeButtonBottom + "</div>");
                scrollToElement(playlist, detailsKara);
            }).fail(function(data){
                displayMessage('warning','Error','could not find lyrics for this song.');
            });
        });

        $('.playlist-main').on('click', '.closeParent', function (e) {
            var el = $(this);
            el.parent().fadeOut(animTime, function(){
                el.parent().remove();
            });
        });

        /* set the right value for switchs */
        $('input[type="checkbox"],[switch="onoff"]').on('switchChange.bootstrapSwitch', function (event) {
            //alert($(this).is(':checked'));
            $(this).val($(this).is(':checked') ? 1 : 0);
        });

        /* handling dynamic loading */
        $('.playlistContainer').scroll(function() {
            var container = $(this);
            var nbKaraInPlaylist = container.find('li').length;
            var loading = container.find(".playlistLoading")
            //console.log(container.scrollTop(), container.innerHeight(), container[0].scrollHeight, loading.css('display'), loading.css('opacity'));
            if(container.scrollTop() + container.innerHeight() + toleranceDynamicPixels >= container[0].scrollHeight & loading.css('opacity') > .95
            && nbKaraInPlaylist >= karaParPage ) {
                container.find(".playlistLoading").fadeIn(400);
                console.log("Ajout de " + karaParPage + " karas aux " + nbKaraInPlaylist + " existants.");
                fillPlaylist(container.find('ul').attr('num'), null, 0, container.find('li').length + karaParPage);
            }
        });

        /* display an element as closable popup */
        popup = function(element, easing, callback) {
            el = $(element);
            el.animate({ opacity: 'toggle', height: 'toggle' }, 'fast', easing, function(){
                el.css('max-height', $(window).height() - 100);
                el.css('top', 50);
                el.css('max-width',$(window).width() * .95);
                el.css('left', ($(window).width() - el.width()) / 2);

                $('body > div[class!="popup"]').css('opacity','.5');
                el.prepend(closePopupButton);
            });
        }
        /* close closable popup */
        $('body').on('click', '.closePopupParent', function (e) {
            var el = $(this);
            el.closest('.popup').fadeOut(animTime);
            el.remove();
            $('body > div[class!="popup"]').css('opacity','1');
        });

        $.ajax({ url: 'public/tags', }).done(function (data) {
            bcTags = data;
        });
    
        /* display a fading message, useful to show success or errors */
        displayMessage = function(type, title, message) {
            var messageDiv = $('#message');
            messageDiv.finish().hide();
            messageDiv.attr('class','alert alert-' + type);
            messageDiv.html('<strong>' + title + '</strong> : ' + message);
            messageDiv.fadeIn(600).delay(2200).fadeOut(600);
           
        }

        /* prevent the virtual keyboard popup when on touchscreen by not focusing the search input */
        if(isTouchScreen) {
            $('select').on('select2:open', function() {
                $('.select2-search input').prop('focus', 0);
            });
        }
        
        $(window).trigger('resize');
    });

    socket = io( window.location.protocol + "//" + window.location.hostname + ":1340");
    
    animTime = $(window).width() < 1000 ? 400 : 400;
    refreshTime = 2000;
    toleranceDynamicPixels = 100;
    karaParPage = 80;
    mode = "list";
    pseudo = "Anonymous";

    dragAndDrop = true;
    stopUpdate = false;

    newKara = [];
    saveLastDetailsKara = [[]];
    ajaxSearch = {}, timer;
    oldState = {};
    oldSearchVal = "";
    isTouchScreen =  "ontouchstart" in document.documentElement;

    addKaraHtml = '<button name="addKara" class="btn btn-sm btn-action"><i class="glyphicon glyphicon-plus"></i></button>';
    deleteKaraHtml = '<button name="deleteKara" class="btn btn-sm btn-action"><i class="glyphicon glyphicon-minus"></i></button>';
    deleteCriteriaHtml = '<button name="deleteCriteria" class="btn btn-action deleteCriteria"><i class="glyphicon glyphicon-minus"></i></button>';
    transferKaraHtml = '<button name="transferKara" class="btn btn-sm btn-action">'
        + '<i class="glyphicon glyphicon-arrow-left"></i><i class="glyphicon glyphicon-arrow-right"></i></button>'
    infoKaraHtml = '<button name="infoKara" class="btn btn-sm btn-action"><i class="glyphicon glyphicon-info-sign"></i></button>';
    closeButton = '<button class="closeParent btn btn-action"><i class="glyphicon glyphicon-remove"></i></button>';
    closeButtonBottom = '<button class="closeParent bottom btn btn-action"><i class="glyphicon glyphicon-remove"></i></button>';
    closePopupButton = '<button class="closePopupParent btn btn-action"><i class="glyphicon glyphicon-remove"></i></button>';
    showFullTextButton = "<button class='fullLyrics btn btn-action'><i class='glyphicon glyphicon-align-justify'></i></button>";
    buttonHtmlPublic = '';
    dragHandleHtml =  "<span class='dragHandle'><i class='glyphicon glyphicon-option-vertical'></i></span>";
    playKaraHtml = "<button class='btn btn-sm btn-action playKara'><i class='glyphicon glyphicon-play'></i></btn>"

    tabTradToDelete = { "TYPE_1001" : "Kara",
    "TYPE_1002" : "Plus long que (sec)",
    "TYPE_1003" : "Plus court que (sec)",
    "TYPE_1000" : "Titre contenant",
    "TYPE_0"    : "Tags",
    "TYPE_1"    : "Inutilisé",
    "TYPE_2"    : "Chanteur",
    "TYPE_3"    : "Type",
    "TYPE_4"    : "Créateur",
    "TYPE_5"    : "Language",
    "TYPE_6"    : "Auteur du kara",
    "TYPE_7"    : "Divers",
    "TYPE_8"    : "Compositeur"
    };

    /* simplify the ajax calls */
    $.ajaxPrefilter(function (options) {
        options.url = window.location.protocol + "//" + window.location.hostname + ":1339/api/v1/" + options.url
    });

    /**
     * Fill a playlist on screen with karas
     * @param {1, 2} num - which playlist on the screen
     * @param {Int} idKara - kara to highlight & scroll to at the end of the work
     * @param {Int} from - returned results start from this number
     * @param {Int} to - returned results end to this number
     */
    // TODO supprimer idKara et reporter sur le reste du code
    // TODO if list is updated from another source (socket ?) keep the size of the playlist
    fillPlaylist = function (num, idKara, from, to) {
        // console.log(num, idKara, from, to);
        var deferred = $.Deferred();
        var idPlaylist = parseInt($("#selectPlaylist" + num).val());
        var filter = $("#searchPlaylist" + num).val();
        var fromTo = "";
        var url, html, canTransferKara, canAddKara, dragHandle, playKara;

        // setup variables depending on which playlist is selected : -1 = database kara list, -2 = blacklist, -3 = whitelist, -4 = blacklist criterias
        if (idPlaylist > 0) {
            url = scope + '/playlists/' + idPlaylist + '/karas';
            html = scope === "admin" ? transferKaraHtml + deleteKaraHtml + addKaraHtml : '';
            canTransferKara = true;
            canAddKara = true;
        } else if (idPlaylist == -1) {
            url = 'public/karas';
            html = addKaraHtml;
            canTransferKara = false;
            canAddKara = false;
            from = from ? from : 0;
            to = to ? to : karaParPage;
            fromTo += "&from=" + from + "&to=" + to;
        } else if (idPlaylist == -2) {
            url = scope + '/blacklist';
            html = scope === "admin" ? '' : '';
            canTransferKara = false;
            canAddKara = true;
        } else if (idPlaylist == -3) {
            url = scope + '/whitelist';
            html = scope === "admin" ? transferKaraHtml + deleteKaraHtml + addKaraHtml : '';
            canTransferKara = true;
            canAddKara = true;
        } else if (idPlaylist == -4) {
            url = scope + '/blacklist/criterias';
            html = deleteCriteriaHtml;
            canTransferKara = false;
            canAddKara = true;
        }
        
        canAddKara = scope === "admin" ? canAddKara : $("#selectPlaylist" + num + " > option:selected").attr("flag_" + playlistToAdd) == "1";
        playKara = scope === "admin" && idPlaylist > 0 ? playKaraHtml : "";

        dragHandle = isTouchScreen && idPlaylist == -1 && num == 1 ? dragHandleHtml : "";
        urlFiltre = url + "?filter=" + filter + fromTo;

        // ask for the kara list from given playlist
        if (ajaxSearch[url]) { ajaxSearch[url].abort(); }
        ajaxSearch[url] = $.ajax({ url: urlFiltre }).done(function (data) {
            //var time = console.timeEnd('ajax');
            //console.log(urlFiltre + " : " + data.length + " résultats");
            
            var htmlContent = "";
            if (mode === "list") {
                if(idPlaylist != -4) {
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            // build the kara line
                            if (data[key].language === null) data[key].language = "";
                            htmlContent += "<li class='list-group-item' idKara='" + data[key].kara_id + "' "
                                + (idPlaylist > 0 ? " idplaylistcontent='" + data[key].playlistcontent_id + "' pos='" + data[key].pos + "' " : "")
                                + (data[key].flag_playing ? "currentlyPlaying" : "" )
                                + ">"
                                + "<div class='btnDiv'>" + html + dragHandle + "</div>"
                                + "<div class='infoDiv'>" + infoKaraHtml + playKara + "</div>"
                                + "<div class='contentDiv''>" + buildKaraTitle(data[key], filter)
                                + (isTouchScreen || true ? "" : "<span class='badge'>" + data[key].language.toUpperCase() + "</span>")
                                + "</div>"
                                + (saveDetailsKara(idPlaylist, data[key].kara_id) ? buildKaraDetails(data[key]) : "")
                               
                                + "</li>";
                        }
                    }

                    document.getElementById("playlist" + num).innerHTML = htmlContent;
                } else {
                    /* Blacklist criterias build */
                    var blacklistCriteriasHtml = $("<div/>");
                    var regenSelect2 = false;
                    if (scope === "admin") {
                        if ($('#blacklistCriteriasInputs').length > 0) {
                            $('#blacklistCriteriasInputs').detach().appendTo(blacklistCriteriasHtml);
                        } else {
                            regenSelect2 = true;
                            blacklistCriteriasHtml = $('<div><span id="blacklistCriteriasInputs" class="list-group-item" style="padding:10px">'
                                + '<select id="bcType" class="input-sm" style="color:black"/> '
                                + '<span id="bcValContainer" style="color:black"></span> '
                                + '<button id="bcAdd" class="btn btn-default btn-action addBlacklistCriteria"><i class="glyphicon glyphicon-plus"></i></button>'
                                + '</span></div>');
                                $.each(tabTradToDelete, function(k, v){
                                    blacklistCriteriasHtml.find('#bcType').append($('<option>', {value: k.replace("TYPE_",""), text: v}));                        
                                });
                        }
                    }
                   
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            if(blacklistCriteriasHtml.find('li[type="' + data[key].type + '"]').length == 0) {
                                blacklistCriteriasHtml.append("<li class='list-group-item liType' type='" + data[key].type + "'>" + tabTradToDelete["TYPE_" + data[key].type] + "</li>");
                            }
                            // build the blacklist criteria line
                            var bcTagsFiltered = jQuery.grep(bcTags, function(obj) {
                                return obj.tag_id == data[key].value;
                            });
                            var tagText = bcTagsFiltered.length == 1 ?  bcTagsFiltered[0].name_i18n : data[key].value;
                            var textContent = data[key].type == 1001 ? buildKaraTitle(data[key].value[0]) : tagText;

                            blacklistCriteriasHtml.find('li[type="' + data[key].type + '"]').after(
                                "<li class='list-group-item liTag' blcriteria_id='" + data[key].blcriteria_id + "'> "
                                + "<div class='btnDiv'>" + html + "</div>"
                                + "<div class='typeDiv'>" + tabTradToDelete["TYPE_" + data[key].type] + "</div>"
                                + "<div class='contentDiv''>" + textContent + "</div>"
                                + "</li>");
                        }
                    }
                   //htmlContent = blacklistCriteriasHtml.html();
                    $("#playlist" + num).empty().append(blacklistCriteriasHtml);
                    if (regenSelect2) { $('#bcType').select2({ theme: "bootstrap", dropdownAutoWidth : true, minimumResultsForSearch: -1 }); }
                    $('#bcType').change();
                }
              
            }
            // depending on the playlist we're in, notify if the other playlist can add & transfer to us
            $('#playlist' + non(num)).attr('canTransferKara', canTransferKara).attr('canAddKara', canAddKara);
            
            deferred.resolve();
            //var time = console.timeEnd('html'); console.log(data.length);
            
            $('#playlist' + num).parent().find('.playlistLoading').fadeOut(400);
          
            // drag & drop part
            // TODO revoir pour bien définir le drag&drop selon les droits
            if (dragAndDrop && scope === "public") {
                var draggableLi =  isTouchScreen ? $("#playlist" + 1 + " > li .dragHandle") : $("#playlist" + 1 + " > li");
                var dropZone = $('#playlist' + non(1)).parent();
                if(draggableLi.draggable('instance') != undefined) {
                    if($("#playlist" + 1).attr('canaddkara') == "true")  {
                        draggableLi.draggable('enable')
                        dropZone.droppable('enable');
                    } else {
                        draggableLi.draggable('disable');
                        dropZone.droppable('disable');
                    }
                } else if( $("#playlist" + 1).attr('canaddkara') == "true") {
                    draggableLi.draggable({
                        cursorAt: { top: 20, right: 15 },
                        helper:  function(){
                            var li = $(this).closest('li');
                            return $("<div class='list-group-item dragged'></div>")
                                .append(li.find('.dragHandle').clone(),li.find('.contentDiv').clone())  },
                        appendTo: dropZone,
                        zIndex: 9999,
                        delay: 0, 
                        distance: 0
                    });
                    dropZone.droppable({
                         classes: {
                            "ui-droppable-hover": "highlight-hover",
                            "ui-droppable-active": "highlight-active"
                            },
                        drop : function(e, ui){ $(ui.draggable).closest('li').find('.btnDiv > [name=addKara]').click(); }
                    });
                }
            } else if(dragAndDrop && scope === "admin") {
                if(idPlaylist > 0) {
                    var sortableUl = $("#playlist" + num);
                    sortableUl.sortable({
                        appendTo: sortableUl,
                        update: function(event, ui) { changeKaraPos(ui.item) },
                       // connectWith: sortableUl2,
                       axis : "y"
                    });
                }
                if ($('#selectPlaylist' + non(num)).val() > 0) {
                    var sortableUl2 = $("#playlist" + non(num));
                    sortableUl2.sortable({
                        appendTo: sortableUl2,
                        update: function(event, ui) { changeKaraPos(ui.item) },
                       // connectWith: sortableUl,
                       axis : "y"
                    });

                    /*
                    helper: function(event, ui){ 
                        var li = $(ui);
                        li.find('.detailsKara, .lyricsKara').remove();
                        li.css('height', 'auto');
                        return li.clone()},
                        start: function(e, ui){
                            ui.placeholder.height(ui.item.height());
                        },
                        */
                }
            }
        });
        return deferred.promise();
    }
    /**
     * Scroll to a kara in a playlist and highlight it
     * @param {1, 2} num - which playlist on the screen
     * @param {Int} idKara - kara to highlight & scroll
     */
    scrollToKara = function (num, idKara) {
        var parent = $("#playlist" + num).parent();
        var element = parent.find("li[idkara='" + idKara + "']");
        if (element.length > 0) {
            var willParentSroll = parent[0].scrollTop != parent[0].clientTop|| (parent[0].clientHeight != parent[0].scrollHeight
                                    && parent.scrollTop() + element.offset().top - parent.offset().top != 0)
            // console.log( parent[0].scrollTop, parent[0].clientTop, parent[0].clientHeight, parent[0].scrollHeight, parent.scrollTop() + element.offset().top - parent.offset().top);
            parent.animate({
                scrollTop: parent.scrollTop() + element.offset().top - parent.offset().top
            }, willParentSroll ? 400 : 0 , function(){
                    element = parent.find("li[idkara='" + idKara + "']"); // element may be lost in the meantime
                    element.finish().effect( "highlight", {color: '#234a35'}, 1000 );
                    element.focus();
            });
        }
    }
    
    /** 
    * Generic function scrolling to an element in its parent
    * @param {Element} parent - parent of the element
    * @param {Element} element - element to scroll to
    * @param {Boolean} highlight - to highlight the element
    */
    scrollToElement = function (parent, element, highlight) {
        var willParentSroll = parent[0].scrollTop != parent[0].clientTop || (parent[0].clientHeight != parent[0].scrollHeight
                                && parent.scrollTop() + element.offset().top - parent.offset().top != 0)
        // console.log( parent[0].scrollTop, parent[0].clientTop, parent[0].clientHeight, parent[0].scrollHeight, parent.scrollTop() + element.offset().top - parent.offset().top);
         parent.animate({
            scrollTop: parent.scrollTop() + element.offset().top - parent.offset().top
        }, willParentSroll ? 400 : 0 , function(){
            if(highlight) {
                element.finish().effect( "highlight", {color: '#234a35'}, 1000 );
                element.focus();
            }
        });
    }
     
    /** 
    * Fill playlist lists & refresh the playlist panels
    * @param {Boolean} triggerChange - (optional) trigger a change of playlist to show a new list of karas
    * @param {1,2} num - (optional) num of the playlist to trigger the change on
    * @param {Int} newVal - set new Id for the playlist num
    */
    fillPlaylistSelects = function (triggerChange, num, newVal) {
        var deferred = $.Deferred();

        var playlistList = {};
        var select1 = $("#selectPlaylist1"), select2 = $("#selectPlaylist2");
        var val1 = select1.val(), val2 = select2.val();
        
        $.ajax({ url: scope + '/playlists', }).done(function (data) {
            playlistList = data; // object containing all the playlists
            if (scope === "admin") {
                playlistList.push({ "playlist_id": -1, "name": "Karas" });
                playlistList.push({ "playlist_id": -2, "name": "Blacklist" });
                playlistList.push({ "playlist_id": -4, "name": "Blacklist criterias" });
                playlistList.push({ "playlist_id": -3, "name": "Whitelist" });
            } else if (scope === "public") {
                if (settingsPublic['EngineAllowViewBlacklist'] == 1) playlistList.push({ "playlist_id": -2, "name": "Blacklist" });
                if (settingsPublic['EngineAllowViewBlacklistCriterias'] == 1) playlistList.push({ "playlist_id": -4, "name": "Blacklist criterias" });
                if (settingsPublic['EngineAllowViewWhitelist'] == 1) playlistList.push({ "playlist_id": -3, "name": "Whitelist" });
            }
            
            // building the options
            var optionHtml = "";
            $("select[type='playlist_select']").empty();
            $.each(playlistList, function (key, value) {
                var params = Object.keys(value).map(function (k, v) {  return k + "='" +  value[k] + "'" }).join(" ");
                optionHtml += "<option " + params + "  value=" + value.playlist_id + "> " + value.name + "</option>";
            });
            $("select[type='playlist_select']").html(optionHtml);
            // setting the right values
            select1.val(val1? val1 : panel1Default);
            select2.val(val2? val2 : select2.find("option[flag_current='1']").val());

            if(newVal != undefined & num != undefined) {
                $("#selectPlaylist" + num).val(newVal);
            }
        
            $(".select2").select2({ theme: "bootstrap",
                                    templateResult: formatPlaylist,
                                    templateSelection : formatPlaylistSelect,
                                    tags: true,
                                    minimumResultsForSearch: 2 });
            deferred.resolve()
            // TODO recup player.private et décider public ou current pour l'appli public / à voir pour se rappeler de la playlist selectionnée dans les cookies pour l'admin ?
            if(scope === "public" && typeof playlistAjoutId == "undefined") {
                $.ajax({ url: 'public/player' }).done(function (data) {
                    playlistToAdd = data['private'] == 1 ? "current" : "public";
                    console.log(playlistToAdd);
                    $.ajax({ url: 'public/playlists/' + playlistToAdd, }).done(function (data) {
                        playlistAjoutId = data.playlist_id;
                        $("#selectPlaylist2").val(playlistAjoutId).change();
                    });
                });
            }
            
            // update the flag part of the panel
            var selectList = scope === "admin" ? [select1, select2] : []; // add [select2] to 2nd part to update the flag buttons in public app (atm not shown so w/e)
            for (var i in selectList) {
                var select = selectList[i];
                var flagPanel = $('#flag' + select.attr('num'));
                var option = select.find("option:selected");
                // managing flags
                ["flag_current", "flag_public"].forEach(function (e) {
                    if (option.attr(e) == "1") { flagPanel.find("button[name='" + e + "']").removeClass('btn-default').addClass('btn-primary'); }
                    else { flagPanel.find("button[name='" + e + "']").removeClass('btn-primary').addClass('btn-default'); }
                });
                flagPanel.find("button[name='flag_visible'] > i").attr('class', option.attr('flag_visible') == "1" ? 'glyphicon glyphicon-eye-open' : 'glyphicon glyphicon-eye-close');   
            }
            
            if(triggerChange) {
                if (num != 1) { fillPlaylist(2); }
                if (num != 2) { fillPlaylist(1); }
            }

        }).fail(function (data) {
            console.log(data);
        });
        return deferred.promise();
    };
   
    /** 
    * refresh the player infos
    * @param {Function} callback - function to call at the end of the refresh
    * @param {anything} param1 - param to give to this function
    */
    refreshCommandStates = function (data, callback, param1) {
        if (oldState != data) {
            var newWidth = 100 * (data.timePosition + refreshTime / 1000) / $('#karaInfo').attr('length') + '%';
            if (data.timePosition != oldState.timePosition && $('#karaInfo').attr('length') != 0) {
                $('#progressBarColor').stop().animate({ width: newWidth }, 1000 * (data.timePosition - oldState.timePosition), 'linear');
            }
            if (oldState.status != data.status || oldState.playerStatus != data.playerStatus) {
                status = data.status === "stop" ? "stop" : data.playerStatus;
                //console.log("status : " + status + " enginestatus : " + data.status  + " playerStatus : " + data.playerStatus );
                switch (status) {
                    case "play":
                        $('#status').attr('name','pause');
                        break;
                    case "pause":
                        $('#status').attr('name', 'play');
                        $('#progressBarColor').clearQueue().stop();
                        break;
                    case "stop":
                        $('#status').attr('name', 'play');
                        $('#progressBarColor').clearQueue().stop();
                        break;
                    default:
                        console.log("ERR : Kara status unknown : " + status);
                }
            }
            if($('input[name="lyrics"]').is(':checked')) {
                var text = data['subText'];
                if(oldState['subText'] != null && text != null && text.indexOf(oldState['subText']) > -1 && text != oldState['subText']) {
                    text.replace(oldState['subText'], "<span style='background-color: #888;'>" + oldState['subText'] + "</span>");
                }
                $('#karaInfo > span').html(text);
            }
            if (data.currentlyPlaying !== oldState.currentlyPlaying && data.currentlyPlaying > 0) {
                $('#progressBarColor').stop().css('width', newWidth);
                $.ajax({ url: 'public/karas/' + data.currentlyPlaying }).done(function (dataKara) {
                    $('#karaInfo').attr('idKara', dataKara[0].kara_id);
                    $('#karaInfo').attr('length', dataKara[0].duration);
                    $('#karaInfo > span').text( buildKaraTitle(dataKara[0]) );
                });
                var panel = $('[type="playlist_select"] > option:selected[flag_current="1"]').closest('.panel');
                panel.find('.list-group-item[currentlyPlaying]').removeAttr('currentlyPlaying');
                panel.find('.list-group-item[idkara="' + data.currentlyPlaying + '"]').attr('currentlyPlaying', '');
            } 
            if (data.showSubs != oldState.showSubs) {
                if (data.showSubs) {
                    $('#showSubs').attr('name','hideSubs');
                } else {
                    $('#showSubs').attr('name','showSubs');
                }
            }
            if (data.muteStatus != oldState.muteStatus) {
                if (data.muteStatus) {
                    $('#mutestatus').attr('name','mute');
                } else {
                    $('#mutestatus').attr('name','unmute');
                }
            }
            if (data.ontop != oldState.ontop) {
                $('input[name="toggleAlwaysOnTop"]').bootstrapSwitch('state', data.ontop, true);
            }
            if (data.fullscreen != oldState.fullscreen) {
                $('input[name="toggleFullscreen"]').bootstrapSwitch('state', data.fullscreen, true);
            }

            oldState = data;
            if (callback && typeof callback === "function" && typeof param1 != "undefined") {
                callback(param1);
            }
        }
    };
 
    /** 
    * Init bootstrapSwitchs
    */
    initSwitchs = function () {
        $("input[switch='onoff'],[name='EnginePrivateMode'],[name='kara_panel'],[name='lyrics']").bootstrapSwitch('destroy', true);

        $("input[switch='onoff']").bootstrapSwitch({
            wrapperClass: "btn btn-default",
            "data-size": "normal"
        });
        $("[name='EnginePrivateMode'],[name='kara_panel'],[name='lyrics']").bootstrapSwitch({
            "wrapperClass": "btn btn-default",
            "data-size": "large",
            "labelWidth": "0",
            "handleWidth": "65",
            "data-inverse": "false"
        });
    }
 
    /** 
    * Build kara title for users depending on the data
    * @param {Object} data - data from the kara
    * @param {String} search - (optional) search made by the user
    * @return {String} the title
    */
    buildKaraTitle = function(data, search) {
        var titleArray = $.grep([data.language.toUpperCase(), data.serie ? data.serie : data.singer,
            data.songtype_i18n_short + (data.songorder > 1 ? " " + data.songorder : ""), data.title], Boolean);
        var titleClean = Object.keys(titleArray).map(function (k) {
                return titleArray[k] ? titleArray[k] : "";
            });
        var titleText = titleClean.join(" - ");

        if(search) {
            var search_regexp = new RegExp("(" + search + ")", "gi");
            titleText = titleText.replace(search_regexp,"<h>$1</h>");
        }
           return titleText;
    }
 
    /** 
    * Build kara details depending on the data
    * @param {Object} data - data from the kara
    * @return {String} the details, as html
    */
    buildKaraDetails = function(data) {
        console.log(data);

        var details = {
                  "Added ": (data['date_add'] ? data['date_add'] : "") + (data['pseudo_add'] ? " by " + data['pseudo_add'] : "")
                , "Author": data['author']
                , "Viewcount": data['viewcount']
                , "Creator": data['creator']
                , "Duration": data['duration'] == 0 || isNaN(data['duration']) ? null : ~~(data['duration'] / 60) + ":" + (data['duration'] % 60 < 10 ? "0" : "") + data['duration'] % 60
                , "Language": data['language_i18n']
                , "Misc": data['misc_i18n']
                , "Series": data['series']
                , "Series_altname": data['series_altname']
                , "Singer": data['singer']
                , "Type ": data['songtype_i18n'] + data['songorder'] > 1 ? " " + data['songorder'] : ""
                , "Pos": data['pos']
                , "series": data['series']
                , "series_altname": data['series_altname']
            }
            var htmlDetails = Object.keys(details).map(function (k) {
                return details[k] ? "<tr><td>" + k + "</td><td>" + details[k] + "</td><tr/>" : "";
            });
			var htmlTable = "<table>" + htmlDetails.join("") + "</table>";
            infoKaraTemp = "<div class='detailsKara alert alert-info'>" + closeButton + showFullTextButton + htmlTable + "</div>";
            return infoKaraTemp;
    }
	
	/*
	*	Manage memory of opened kara details
	*	idPlaylist {Int} : id of the playlist the details are opened/closed in 
	*	idKara {Int} : id of the kara having his details opened
	*	command {Int} : command to execute, "add"/"remove" to add/remove to/from the list, nothing to just know if the details are opened
	*/
	saveDetailsKara = function(idPlaylist, idKara, command) {
		if(isNaN(idPlaylist) || isNaN(idKara)) { return false; }
		idPlaylist = parseInt(idPlaylist);
		idKara = parseInt(idKara);
		if(saveLastDetailsKara[idPlaylist + 1000] == undefined) { saveLastDetailsKara[idPlaylist + 1000] = []; }
		if(command == "add") {
			saveLastDetailsKara[idPlaylist + 1000].push(idKara);
		} else if(command == "remove") {
			saveLastDetailsKara[idPlaylist + 1000].pop(idKara);
		} else {
		//console.log("ah",(-1 != $.inArray(idKara, saveLastDetailsKara[idPlaylist + 1000])));
			return (-1 != $.inArray(idKara, saveLastDetailsKara[idPlaylist + 1000]));
		}
	}

    formatPlaylist = function (playlist) {
        if (!playlist.id) { return playlist.text; }
        if (!$(playlist.element).attr('flag_current') == "1" && !$(playlist.element).attr('flag_public') == "1") { return playlist.text; }
    
        var icon = "";
        if ($(playlist.element).attr('flag_current') == "1") {
            icon =  '<i class="glyphicon glyphicon-facetime-video"></i>'
        } else if ($(playlist.element).attr('flag_public') == "1") {
            icon = '<i class="glyphicon glyphicon-indent-left"></i>';
        }

        var $option = $('<span>' + icon + ' ' + playlist.text + '</span>');

        return $option;
    }
    formatPlaylistSelect = function (playlist, container) {
        
        if (!playlist.id) { return playlist.text; }
        if (!$(playlist.element).attr('flag_current') == "1" && !$(playlist.element).attr('flag_public') == "1") { return playlist.text; }

        var icon = "";
        if ($(playlist.element).attr('flag_current') == "1") {
            icon =  '<i class="glyphicon glyphicon-facetime-video"></i>'
        } else if ($(playlist.element).attr('flag_public') == "1") {
            icon = '<i class="glyphicon glyphicon-indent-left"></i>';
        }

        var $option = $('<span>' + icon + ' ' + playlist.text + '</span>');

        return $option;
    }

    $(window).resize(function () {
        //  initSwitchs();$
        var topHeight = $('.panel-heading.container-fluid').outerHeight();
        $('#playlist1').parent().css('height', 'calc(100% - ' + (scope === "public" ? 0 : topHeight) + 'px ');
        $('#playlist2').parent().css('height', 'calc(100% - ' + topHeight + 'px  ');
    });

    /* opposite number of playlist : 1 or 2 */
    non = function (num) {
        return 3 - parseInt(num);
    }

    sideOfPlaylist = function(idPlaylist) {
        var num = $('[type="playlist_select"] > option:selected[value="' + idPlaylist + '"]').parent().attr('num');
        return num;
    }

     /*
    checkSearch = function () {
        if ($('#search').val() != oldSearchVal) {
            oldSearchVal = $('#search').val();
            console.time('public/karas?filter=' + oldSearchVal);
            fillPlaylist(1);
        } else {
            console.log("recherche identique");
        }
    }
    */

    // repetitive ajax calls to refresh infos on the screen
    /*
    setInterval(function () {
        if (false & !stopUpdate) {
            refreshCommandStates("refresh");
        }
    }, refreshTime);

    setInterval(function () {
        if (!stopUpdate) {
            if(!(($('#selectPlaylist2').data('select2') && $('#selectPlaylist2').data('select2').isOpen()) || ($('#selectPlaylist1').data('select2')
                && $('#selectPlaylist1').data('select2').isOpen()))) { 
                    scope === "public" ? getPublicSettings(false) : fillPlaylistSelects(); 
                }
            if($('#selectPlaylist1').val() != -1 && $('#playlist1 .lyricsKara:visible').length == 0) { fillPlaylist(1); }
            if($('#selectPlaylist2').val() != -1 && $('#playlist2 .lyricsKara:visible').length == 0) { fillPlaylist(2); }
        }
    }, refreshTime * 2.5);
*/
    /* partie socket */

    socket.on('playerStatus', function(data){
        refreshCommandStates(data)
    });
    
    socket.on('settingsUpdated', function(data){
        scope === "admin" ? getSettings() : getPublicSettings(false);
    });

    socket.on('playlistsUpdated', function(){
        if(!(($('#selectPlaylist2').data('select2') && $('#selectPlaylist2').data('select2').isOpen())
                || ($('#selectPlaylist1').data('select2') && $('#selectPlaylist1').data('select2').isOpen()))) { 
            playlistsUpdating = fillPlaylistSelects(); 
        }
    });

    socket.on('playlistInfoUpdated', function(idPlaylist){
        if (idPlaylist) {
            var num = sideOfPlaylist(idPlaylist);
            if(num && !($('#selectPlaylist' + num).data('select2') && $('#selectPlaylist' + num).data('select2').isOpen())) {
                fillPlaylistSelects();
            }
        }
    });

    socket.on('playlistContentsUpdated', function(idPlaylist){
        var num = sideOfPlaylist(idPlaylist);
        if(num && $('#playlist' + num + '.lyricsKara:visible').length == 0) {
            playlistContentUpdating = fillPlaylist(num);
        }
    });

    socket.on('blacklistUpdated', function(){
        var idPlaylist = -2;
        var num = sideOfPlaylist(idPlaylist);
        if(num && $('#playlist' + num + '.lyricsKara:visible').length == 0) {
            playlistContentUpdating = fillPlaylist(num);
        }
        idPlaylist = -4;
        var num = sideOfPlaylist(idPlaylist);
        if(num && $('#playlist' + num + '.lyricsKara:visible').length == 0) {
            playlistContentUpdating = fillPlaylist(num);
        }
       
    });

    socket.on('whitelistUpdated', function(idPlaylist){
        var idPlaylist = -3;
        var num = sideOfPlaylist(idPlaylist);
        if(num && $('#playlist' + num + '.lyricsKara:visible').length == 0) {
            playlistContentUpdating = fillPlaylist(num);
        }
    });

}));


