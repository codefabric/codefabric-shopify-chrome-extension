(function() {

  var extensionJs = (function(shopify, jq) {
    var CodeFabric = CodeFabric || {};
    CodeFabric.Shopify = CodeFabric.Shopify || {};
    if (!CodeFabric.Shopify.Extension) {

      CodeFabric.Shopify.Extension = function () {
        // Private
        var self = this;

        //Shopify functions
        var showMessage = function (message, isError) {
          isError ? shopify.Flash.error(message) : shopify.Flash.notice(message);
        };

        var showError = function (error) {
          showMessage(error, true);
        };

        // HTML snippets
        var cardHtml = '<div class="next-card"></div>';
        var cardHeader = '<header class="next-card__header"></header>';
        var cardOuterGrid = '<div class="next-grid next-grid--inner-grid next-grid--no-padding next-grid--vertically-centered"></div>';
        var cardInnerGrid = '<div class="next-grid next-grid--no-outside-padding next-grid--vertically-centered"></div>';
        var cardGridCell = '<div class="next-grid__cell"></div>';
        var cardGridCellNoFlex = '<div class="next-grid__cell next-grid__cell--no-flex"></div>';
        var cardHeaderTitle = '<h2 class="next-heading"></h2>';

        var cardContentWrapper = '<div class="next-card__section"></div>';
        var cardInputWrapper = '<div class="next-input-wrapper"></div>';
        var cardInputTitle = '<label class="next-label"></label>';
        var cardInputTextBox = '<input type="text" class="next-input" size="30" />';
        var cardInputTextArea = '<textarea class="next-input" size="30" rows="10"></textarea>';
        var cardInputDropdown = '<select></select>';


        // HTML builder functions
        var addCard = function (cardHandle) {
          return this.append(jq(cardHtml).addClass(cardHandle)).find('.' + cardHandle);
        };

        var addCardHeader = function(headerText, actions) {
          var header = this.append(cardHeader).find('header');

          if (!actions || actions.length == 0) {
            header.append(jq(cardHeaderTitle).text(headerText));
          }
          else {
            var grid = header.append(cardOuterGrid).find('.next-grid');
            
            grid.append(jq(cardGridCell).append(jq(cardHeaderTitle).text(headerText)));

            var actionsGrid = grid.append(jq(cardGridCellNoFlex).append(jq(cardInnerGrid).addClass('actions'))).find('.actions');
            for (var actionIdx = 0; actionIdx < actions.length; actionIdx++) {
              var action = actions[actionIdx];
              var actionLink = actionsGrid.append(jq(cardGridCellNoFlex).append('<a class="action-' + action.handle + '" href>' + action.title + '</a>')).find('.action-' + action.handle);
              actionLink.on('click', action.onClick);
            }
          }

          return this;
        };

        var addCardContent = function (content) {
          var wrapper = this.find('.next-card__section');
          if (!wrapper || wrapper.length == 0) {
            wrapper = this.append(cardContentWrapper).find('.next-card__section');
          }

          wrapper.append(content);

          return this;
        };

        var createRichTextArea = function (title, handle, value) {
          var wrapper = jq(cardInputWrapper).append(jq(cardInputTitle).text(title))
                                     .append(jq(cardInputTextArea).val(value)
                                                                  .attr({'name': handle, 'id': handle}));
          new shopify.Rte(wrapper);
          return wrapper;
        };

        var createTextArea = function (title, handle, value) {
          return jq(cardInputWrapper).append(jq(cardInputTitle).text(title))
                                     .append(jq(cardInputTextArea).val(value)
                                                                  .attr({'name': handle, 'id': handle}));
        };

        var addDropdown = function (title, handle, options, value) {

        };

        var isShopify = function () {
          return /^http[s]?\:\/\/[^\\\/]+\.myshopify\.com\/admin\/.*$/i.test(location.href);
        };

        var getAdminPage = function () {
          return location.href.match(/^http[s]?\:\/\/[^\\\/]+\.myshopify\.com\/admin\/([^\\\/]+)[\/]?(\d+)*.*$/i);
        };

        var loadProductListExtensions = function() {

        };

        var createTab = function (tab, pages) {
          var pageOptions = '';
          for (var pageIdx = 0; pageIdx < pages.length; pageIdx++) {
            var page = pages[pageIdx];
            pageOptions += '<option value="' + page.handle + '">' + page.title + '</option>';
          }

          var keyHandle = tab.key.toLowerCase().replace(' ', '-');
          var tabContent = jq(cardInputWrapper)
                            .append(jq(cardOuterGrid)
                              .append(jq(cardGridCell)
                                .append(jq(cardInputTitle).text(tab.key)
                                                          .attr({ 'for': 'tab-' + keyHandle })))
                              .append(jq(cardGridCellNoFlex)
                                .append(jq(cardInnerGrid)
                                  .append(jq(cardGridCellNoFlex).append('<label for="' + keyHandle +'_type_text" class="next-label next-label--inline">Text</label><input type="radio" name="' + keyHandle +'_type" id="' + keyHandle +'_type_text" value="text" />'))
                                  .append(jq(cardGridCellNoFlex).append('<label for="' + keyHandle +'_type_page" class="next-label next-label--inline">Page</label><input type="radio" name="' + keyHandle +'_type" id="' + keyHandle +'_type_page" value="page" />'))
                                  .append(jq(cardGridCellNoFlex).append('<label for="' + keyHandle +'_type_snippet" class="next-label next-label--inline">Snippet</label><input type="radio" name="' + keyHandle +'_type" id="' + keyHandle +'_type_snippet" value="text" />'))
                                 )
                              )
                            )
                            .append(jq(cardInputTextArea)
                              .addClass('text')
                              .val(tab.value)
                              .hide()
                              .attr({'name': 'tab-' + tab.key + '_text', 'id': 'tab-' + keyHandle + '_text' })
                            )
                            .append(jq(cardInputDropdown)
                              .addClass('page')
                              .append(pageOptions)
                              .hide()
                              .attr({'name': 'tab-' + tab.key + '_page', 'id': 'tab-' + keyHandle + '_page' })
                            )
                            .append(jq(cardInputTextBox)
                              .addClass('snippet')
                              .hide()
                              .attr({'name': 'tab-' + tab.key + '_snippet', 'id': 'tab-' + keyHandle + '_snippet' })
                            );

          var textarea = tabContent.find('#tab-' + keyHandle +'_text');
          var snippetDropdown = tabContent.find('#tab-' + keyHandle +'_snippet');
          var pageDropdown = tabContent.find('#tab-' + keyHandle +'_page');

          var snippetRadio = tabContent.find('#' + keyHandle +'_type_snippet');
          var pageRadio = tabContent.find('#' + keyHandle +'_type_page');
          var textRadio = tabContent.find('#' + keyHandle +'_type_text');

          var snippetMatch = tab.value.match(/^\{([^\{\}]+)\}$/);
          var pageMatch = tab.value.match(/^\[([^\[\]]+)\]$/);
          if (snippetMatch && snippetMatch.length > 1) {
            snippetDropdown.val(snippetMatch[1]).show();
            snippetRadio.attr({ 'checked': 'checked' });
          }
          else if (pageMatch && pageMatch.length > 1) {
            pageDropdown.val(pageMatch[1]).show();
            pageRadio.attr({ 'checked': 'checked' });
          }
          else {
            textarea.val(tab.value).show();
            textRadio.attr({ 'checked': 'checked' });
          }

          snippetRadio.on('change', function(e) {
            e.preventDefault();
            jq(this).closest('.next-input-wrapper').find('.text, .snippet, .page').hide();
            if (this.checked) {
              jq(this).closest('.next-input-wrapper').find('.snippet').show();
            }
          });

          pageRadio.on('change', function(e) {
            e.preventDefault();
            jq(this).closest('.next-input-wrapper').find('.text, .snippet, .page').hide();
            if (this.checked) {
              jq(this).closest('.next-input-wrapper').find('.page').show();
            }
          });

          textRadio.on('change', function(e) {
            e.preventDefault();
            jq(this).closest('.next-input-wrapper').find('.text, .snippet, .page').hide();
            if (this.checked) {
              jq(this).closest('.next-input-wrapper').find('.text').show();
            }
          });

          return tabContent;
        };

        var loadProductExtensions = function(productId) {
          var result = jq.Deferred();

          var productForm = jq('form#edit_product_' + productId);
          if (!productForm || productForm.length == 0) {
            return;
          }
          else {
            var isLoadedField = productForm.find('#codefabric_extension_loaded');
            if (!isLoadedField || isLoadedField.length == 0) {
              productForm.append('<input type="hidden" id="codefabric_extension_loaded" value="true" />');
              productForm.on('change', function() {
                loadProductExtensions(productId);
              });
            }
          }

          jq.when(jq.get('/admin/products/' + productId + '/metafields.json?namespace=tab'),
                  jq.get('/admin/pages.json'))
            .done(function (productData, pageData) {


              var tabsCard = jq(cardHtml).addClass('tabs-editor');

              addCardHeader.call(tabsCard, 'Tabs', [ 
                { handle: 'add-tab', title: 'Add a new tab', onClick: function(e) {
                    e.preventDefault();
                    var modal = new shopify.Modal(jq('<div><p>Banana!</p></div>'));
                    modal.show();
                } },
                { handle: 'tab-order', title: 'Change tab order', onClick: function() {} } 
              ]);

              var tabs = productData[0].metafields;
              var order = [];
              if (tabs.filter(function(e, i) { return e.key == '_order'; }).length > 0) {
                order = tabs.filter(function(e, i) { return e.key == '_order'; })[0].value.split(',');
              }

              if (order) {
                for (var orderIdx = 0; orderIdx < order.length; orderIdx++) {
                  var tabName = order[orderIdx].trim();
                  var tab = tabs.filter(function(e, i) { return e.key == tabName; });
                  if (tab.length > 0) {
                    tab = tab[0];
                    var tabElement = createTab(tab, pageData[0].pages);
                    addCardContent.call(tabsCard, tabElement);
                  }
                }

                for (var tabIdx = 0; tabIdx < tabs.length; tabIdx++) {
                  var tab = tabs[tabIdx];
                  if (tab.key == '_order') {
                    continue;
                  }

                  if (order.filter(function (e, i) { return e.trim() == tab.key; }) == 0) {
                    var tabElement = createTab(tab, pageData[0].pages);
                    addCardContent.call(tabsCard, tabElement);
                  }
                }
              }
              else {
                for (var tabIdx = 0; tabIdx < tabs.length; tabIdx++) {
                  var tab = tabs[tabIdx];
                  var tabElement = createTab(tab, pageData[0].pages);
                  addCardContent.call(tabsCard, tabElement);
                }
              }

              jq('.next-card.images').before(tabsCard);

              result.resolve();
            });

          return result;
        };

        // Public
        return {
          init: function () {
            if (!isShopify()) {
              showError('CodeFabric Shopify extensions cannot be used outside of Shopify Admin!');
              return;
            }

            var adminPage = getAdminPage();
            if (adminPage && adminPage.length > 1)
            {
              var promise = null;
              switch (adminPage[1]) {
                case 'products':
                  if (adminPage.length > 2) {
                    promise = loadProductExtensions(adminPage[2]);
                  }
                  else {
                    loadProductListExtensions();
                  }
                  break;

                default:
                  console.log("Don't have any extensions to load for " + adminPage[1] + "!");
                  break;
              }
            }

            if (promise) {
              promise.done(function () {
                showMessage('CodeFabric Shopify extensions loaded!');
              });
            }
            else {
              showMessage('CodeFabric Shopify extensions loaded!');
            }
            
          }
        };

      };
    }

    var extension = new CodeFabric.Shopify.Extension();
    extension.init();
  });

  /** Utilities and loading **/

  var utils = {
    loadScript: function (url, callback) {

        var script = document.createElement("script")
        script.type = "text/javascript";

        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                        script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {  //Others
            script.onload = function () {
                callback();
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    },

    loadCss: function (url, callback) {

        var link = document.createElement("link")
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "all";

        if (link.readyState) {  //IE
            link.onreadystatechange = function () {
                if (link.readyState == "loaded" ||
                        link.readyState == "complete") {
                    link.onreadystatechange = null;
                    callback();
                }
            };
        } else {  //Others
            link.onload = function () {
                callback();
            };
        }

        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    },

    ensureCss: function (callback) {
      utils.loadCss('https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css', callback);
    },

    ensureJQuery: function (minVersion, src, callback) {
      if ((typeof jQuery === 'undefined') || (parseFloat(jQuery.fn.jquery) < minVersion)) {
        utils.loadScript(src, function () {
            jqCodeFabric = jQuery.noConflict(true);
            jqCodeFabric(function() { callback(jqCodeFabric); });
        });
      } else {
        jQuery(function () { callback(jQuery); });
      }
    },

    ensureShopify: function (callback) {
      if (typeof Shopify === 'undefined') {
        console.error('Not loaded from a Shopify store!')
      } else {
        callback(Shopify);
      }
    },

    ensureDependencies: function (callback) {
      utils.ensureCss(function() {
        utils.ensureJQuery(1.9, '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
          function ($) {
            utils.ensureShopify(function(shopify) {
              callback(shopify, $);
            });
          }
        );
      });
    }
  };

  utils.ensureDependencies(function (s, jq) {
    extensionJs.call(this, s, jq, {});
  });

})();