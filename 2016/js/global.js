(function() {
  var App, Gallery, Responsive, Share, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.scrolling = false;

  root.url = $('head').attr('data-url');

  root.baseurl = $('head').attr('data-base-url');

  root.panel_triangles = [];

  $(function() {
    if (!window.console) {
      window.console = {};
    }
    if (!window.console.log) {
      window.console.log = function() {
        return {};
      };
    }
    return App.init();
  });

  $(document).ready(function() {
    $(document).on('click', '#js-site-title-link', function(e) {
      e.preventDefault();
      return History.pushState({
        target: 'panel'
      }, "Annual Report 2016 | AESA", root.url + root.baseurl + '/home');
    });
    $(document).on('click', '.js-topic-close', function(e) {
      e.preventDefault();
      App.close_topics();
      if ($('.panels-nav-item.active').length > 0) {
        return $('.panels-nav-item.active .panels-nav-link').click();
      } else {
        if ($(window).innerWidth() > 1180) {
          return App.scroll_to_panel($('#home').attr('data-panel-id'), '#home');
        }
      }
    });
    if ($(window).innerWidth() > 1024) {
      $(document).on('mouseenter', '.panel.active .panel-tile', function(e) {
        var panel_index;
        if ($(this).find('.js-bg-triangle').length > 0) {
          panel_index = $('.panel.active .panel-tile').index(this);
          if (panel_index >= 0) {
            return root.panel_triangles[panel_index].closeAll();
          }
        }
      }).on('mouseleave', '.panel.active .panel-tile', function(e) {
        var panel_index;
        if ($(this).find('.js-bg-triangle').length > 0) {
          panel_index = $('.panel.active .panel-tile').index(this);
          if (panel_index >= 0) {
            return root.panel_triangles[panel_index].start();
          }
        }
      });
    }
    $(document).on('click', '.js-topic-link', function(e) {
      var $el;
      e.preventDefault();
      $el = $(this);
      return History.pushState({
        target: 'topic'
      }, $el.attr('data-related-topic') + " | Annual Report 2016 | AESA", root.url + $el.attr('href'));
    });
    $(document).on('click', '.js-panel-link', function(e) {
      var $el, $panel;
      e.preventDefault();
      $el = $(this);
      $panel = $(".panel[data-panel-id=" + $el.attr('data-related-panel') + "]");
      if ($el.attr('href').indexOf('home') >= 0) {
        App.hide_toolbar();
      } else {
        App.show_toolbar();
      }
      App.scroll_to_panel($el.attr('data-related-panel'), $panel);
      return History.pushState({
        target: 'panel'
      }, $el.text() + " | Annual Report 2016 | AESA", root.url + $el.attr('href'));
    });
    History.Adapter.onDomLoad(function() {
      var State, hash_array, hash_base;
      History.options.disableSuid = true;
      State = History.getState();
      hash_array = State.hash.split('/');
      hash_base = root.baseurl !== '' ? hash_array[2] : hash_array[1];
      if ($(window).innerWidth() > 1024) {
        root.panel_triangles[0] = new TrianglesLife('cover-triangle');
        root.panel_triangles[0].start();
      }
      if (hash_base) {
        if (hash_base.indexOf('topics') >= 0) {
          App.show_toolbar();
          if (root.baseurl !== '') {
            return App.show_topic(hash_array[3]);
          } else {
            return App.show_topic(hash_array[2]);
          }
        } else {
          if ($('.topic').length > 0) {
            App.close_topics();
          }
          if (hash_base) {
            if (hash_base.substring(0, 1) !== "#") {
              if (hash_base.indexOf('home') >= 0) {
                App.hide_toolbar();
              } else {
                App.show_toolbar();
              }
              return App.scroll_to_panel($('#' + hash_base).attr('data-panel-id'), '#' + hash_base);
            }
          }
        }
      }
    });
    return History.Adapter.bind(window, 'statechange', function() {
      var State, hash_array, hash_base, target;
      History.options.disableSuid = true;
      State = History.getState();
      target = State.data.target;
      if (target === 'topic') {
        return $.get(State.url + '/', function(data) {
          var topic_slug;
          document.title = $(data).find(".topic-header-title").text() + ' | Annual Report 2016 | AESA';
          topic_slug = $(data).find('article.topic').attr('data-topic-slug');
          if ($('.topic[data-topic-slug=' + topic_slug + ']').length) {

          } else {
            $('#topics').append($(data).find('article.topic'));
            Gallery.init();
          }
          if ($('article.topic[data-topic-slug="' + topic_slug + '"]').hasClass('active')) {
            return App.close_menu();
          } else {
            return App.show_topic(topic_slug);
          }
        });
      } else {
        hash_array = State.hash.split('/');
        hash_base = root.baseurl !== '' ? hash_array[2] : hash_array[1];
        if (hash_base) {
          if ((hash_base.indexOf('topics') < 0) && ($('.topic.active').length > 0)) {
            App.close_topics();
          }
        }
        if (target !== 'panel-manual') {
          if (hash_base) {
            if (hash_base.substring(0, 1) !== "#") {
              return App.scroll_to_panel($('#' + hash_base).attr('data-panel-id'), '#' + hash_base);
            }
          }
        }
      }
    });
  });

  App = {
    init: function() {
      App.bind_events();
      App.panels_nav();
      Gallery.init();
      Responsive.init();
      return Share.init();
    },
    bind_events: function() {
      var $elem_full_height;
      $elem_full_height = $('.js-height');
      $(window).on('resize', function() {
        return $elem_full_height.each(function() {
          return $(this).css({
            height: $(window).height()
          });
        });
      });
      $(window).trigger('resize');
      $('.js-cover-panels-link').on('mouseover', function() {
        var related_panel;
        related_panel = $(this).attr('data-related-panel');
        $('.js-panels-thumbs').removeClass('active');
        return $('.js-panels-thumbs[data-related-panel="' + related_panel + '"]').addClass('active');
      }).on('mouseout', function() {
        var related_panel;
        related_panel = $(this).attr('data-related-panel');
        return $('.js-panels-thumbs[data-related-panel="' + related_panel + '"]').removeClass('active');
      });
      $('#js-highlights-toggle, #js-highlights-bg').on('click', function(e) {
        e.preventDefault();
        $('body').toggleClass('highlights_active');
        $('#js-highlights-content').slideToggle({
          duration: 400,
          easing: $.bez([0.165, 0.84, 0.44, 1])
        });
        return $('#js-highlights-bg').toggleClass('opened');
      });
      $('#js-highlights-filters-list').hide();
      $('#js-highlights-filters-toggle').on('click', function(e) {
        e.preventDefault();
        $('#js-highlights-filters-toggle i').toggle();
        return $('#js-highlights-filters-list').slideToggle({
          duration: 400,
          easing: $.bez([0.165, 0.84, 0.44, 1])
        });
      });
      return $('.js-deploy-list').on('click', function(e) {
        var deploy, deploy_link;
        e.preventDefault();
        deploy_link = $(this);
        deploy = !deploy_link.hasClass('opened') ? true : false;
        $('.js-menu-list-title .js-panel-link, .js-menu-sublist, .js-deploy-list').removeClass('opened');
        $('.js-menu-sublist').stop(true, true).slideUp(350, $.bez([0.165, 0.84, 0.44, 1]));
        if (deploy) {
          deploy_link.closest('.js-menu-list-title').find('.js-panel-link').addClass('opened');
          deploy_link.addClass('opened');
          return deploy_link.closest('.has_submenu').find('.js-menu-sublist').addClass('opened').stop(true, true).slideDown(350, $.bez([0.165, 0.84, 0.44, 1]));
        }
      });
    },
    scroll_to_panel: function(panel_index, panel_el) {
      var $panel, duration, j, len, panel_triangle, ref;
      root.scrolling = true;
      App.close_menu();
      if (!panel_index) {
        panel_index = 1;
      }
      if (!panel_el) {
        panel_el = '#home';
      }
      $panel = $(panel_el);
      if ($(window).innerWidth() > 1024) {
        if ($('canvas[width]').length > 0) {
          ref = root.panel_triangles;
          for (j = 0, len = ref.length; j < len; j++) {
            panel_triangle = ref[j];
            panel_triangle.kill();
          }
        }
        root.panel_triangles = [];
        $panel.find('.js-bg-triangle').each(function(i) {
          root.panel_triangles[i] = new TrianglesLife($(this).attr('id'));
          return root.panel_triangles[i].start();
        });
      }
      duration = Math.abs($panel.offset().top - window.scrollY) / 1500;
      return TweenMax.to(window, duration, {
        scrollTo: {
          y: $panel.offset().top
        },
        ease: Power4.easeInOut,
        onComplete: (function(_this) {
          return function() {
            var el_index, scrolling_timeout;
            $panel.addClass('active');
            $('.js-panels-sections').removeClass('active');
            el_index = parseInt(panel_index);
            if (el_index > 1) {
              $('.js-panels-sections[data-panel-id="' + el_index + '"]').addClass('active');
            }
            if (el_index === 1) {
              App.hide_toolbar();
            } else {
              App.show_toolbar();
            }
            clearTimeout(scrolling_timeout);
            return scrolling_timeout = setTimeout(function() {
              return root.scrolling = false;
            }, 1000);
          };
        })(this)
      });
    },
    scroll_to_next_panel: function() {
      if ($('.panels-nav-item.active').length > 0) {
        if ($('.panels-nav-item.active + .panels-nav-item').length > 0) {
          return $('.panels-nav-item.active + .panels-nav-item .panels-nav-link').click();
        } else {
          return root.scrolling = false;
        }
      } else {
        if ($(window).innerWidth() > 1180) {
          return App.scroll_to_panel($('#key-figures').attr('data-panel-id'), '#key-figures');
        }
      }
    },
    scroll_to_prev_panel: function() {
      if ($('.panels-nav-item.active').length > 0) {
        if ($('.panels-nav-item.active').prev('.panels-nav-item').length > 0) {
          return $('.panels-nav-item.active').prev('.panels-nav-item').find('.panels-nav-link').click();
        } else {
          return root.scrolling = false;
        }
      } else {
        if ($(window).innerWidth() > 1180) {
          return App.scroll_to_panel($('#home').attr('data-panel-id'), '#home');
        }
      }
    },
    force_panels_scrolling: function() {
      $('.js-panel, .js-panels-nav, .js-panels-sections').on('DOMMouseScroll mousewheel', function(e) {
        if (!root.scrolling && !($('.topic.active').length > 0)) {
          root.scrolling = true;
          if (e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0) {
            App.scroll_to_next_panel();
          } else {
            App.scroll_to_prev_panel();
          }
        }
        if (!($('.topic.active').length > 0)) {
          return false;
        }
      });
      return $('html').on('keydown', function(e) {
        var active_key;
        active_key = e.which;
        if (!root.scrolling && !($('.topic.active').length > 0)) {
          root.scrolling = true;
          if (active_key === 40) {
            e.preventDefault();
            App.scroll_to_next_panel();
            return false;
          }
          if (active_key === 38) {
            e.preventDefault();
            App.scroll_to_prev_panel();
            return false;
          }
          return true;
        } else {
          if (root.scrolling && (active_key === 38 || active_key === 40)) {
            return false;
          }
        }
      });
    },
    panels_nav: function() {
      var $panels, $panels_nav;
      $panels = $('.js-panel');
      $panels_nav = $('.js-panels-nav');
      $('.panels-nav-item:first').addClass('active');
      if ($panels_nav.length) {
        $panels_nav.find('a').on('click', function(e) {
          var $el, $panel;
          e.preventDefault();
          e.stopImmediatePropagation();
          $el = $(this).hasClass('tooltip') ? $(this).closest('.panels-nav-link') : $(this);
          $panel = $(".panel[data-panel-id=" + $el.attr('data-related-panel') + "]");
          $panels.removeClass('active');
          $panels_nav.find('.active').removeClass('active');
          $el.closest('.panels-nav-item').addClass('active');
          App.scroll_to_panel($el.attr('data-related-panel'), $panel);
          return History.pushState({
            target: 'panel'
          }, $el.find('.tooltip').text() + " | Annual Report 2014 | CropTrust", root.url + root.baseurl + $el.attr('href'));
        });
      }
      return App.panels_nav_spy();
    },
    panels_nav_spy: function() {
      var $panels, $panels_nav;
      $panels = $('.js-panel');
      $panels_nav = $('.js-panels-nav');
      return $panels.each(function(i) {
        var $panel, position;
        $panel = $(this);
        position = $panel.position();
        return $panel.scrollspy({
          min: position.top - ($panel.height() * 0.1 | 0),
          max: position.top + ($panel.height() * 0.9 | 0),
          onEnter: function(element, position) {
            var el_index;
            if (!($('.topic.active').length > 0)) {
              $panels_nav.find('li.active').removeClass('active');
              $panels_nav.find("li:eq(" + ($(element).index()) + ")").addClass('active');
              if (!root.scrolling) {
                el_index = $(element).index();
                $('.js-panels-sections').removeClass('active');
                if (el_index > 0) {
                  App.show_toolbar();
                  $('.js-panels-sections[data-panel-id="' + (el_index + 1) + '"]').addClass('active');
                } else {
                  App.hide_toolbar();
                }
                return History.pushState({
                  target: 'panel-manual'
                }, $panel.find('h2.u-outline').text() + " | Annual Report 2016 | AESA", root.url + root.baseurl + '/' + $panel.attr('id'));
              }
            }
          }
        });
      });
    },
    show_toolbar: function() {
      $('.js-site-title').removeClass('white');
      return $('.menu-toggle').addClass('active');
    },
    hide_toolbar: function() {
      if ($(window).innerWidth() > 1024) {
        $('.js-site-title').addClass('white');
        return $('.menu-toggle').removeClass('active');
      }
    },
    show_menu: function() {
      $('#js-menu, #js-menu-bg, #js-menu-toggle').addClass('opened');
      return $('body').addClass('menu_active');
    },
    close_menu: function() {
      $('#js-menu, #js-menu-bg, #js-menu-toggle, .js-menu-list-title .js-panel-link, .js-menu-sublist, .js-deploy-list').removeClass('opened');
      return $('body').removeClass('menu_active');
    },
    show_topic: function(topic_slug) {
      var j, len, new_topic, new_topic_order, old_topic, old_topic_aside, old_topic_content, old_topic_header, old_topic_order, panel_triangle, ref, topic_aside, topic_content, topic_header;
      App.show_toolbar();
      App.close_menu();
      $('html, body').addClass('topic_active');
      $('.js-site-title').removeClass('white');
      $('.topic .js-topic-next').hide();
      if ($(window).innerWidth() > 1024 && $('canvas[width]').length > 0) {
        ref = root.panel_triangles;
        for (j = 0, len = ref.length; j < len; j++) {
          panel_triangle = ref[j];
          panel_triangle.kill();
        }
        root.panel_triangles = [];
      }
      if ($('.topic.active').length > 0) {
        old_topic = $('.topic.active');
        old_topic_order = parseInt($('.topic.active').attr('data-topic'), 10);
        old_topic_aside = old_topic.find('.topic-aside-wrapper');
        old_topic_content = old_topic.find('.topic-content-wrapper');
        old_topic_header = old_topic.find('.topic-header-wrapper');
        $('.topic.prev-active').removeClass('prev-active');
        $('.topic.active').addClass('prev-active').removeClass('active');
        $('.js-topic-header-pager').removeClass('active');
        new_topic = $(".topic[data-topic-slug=" + topic_slug + "]");
        topic_aside = new_topic.find('.topic-aside-wrapper').hide();
        topic_content = new_topic.find('.topic-content-wrapper');
        topic_header = new_topic.find('.topic-header-wrapper');
        new_topic_order = parseInt(new_topic.attr('data-topic'), 10);
        topic_header.find('.js-topic-header-pager').addClass('hidden');
        if ($(window).innerWidth() >= 1024) {
          topic_content.scrollTop(0);
          if (new_topic_order < old_topic_order) {
            $('#js-topic-over-filter').addClass('active--back');
            TweenMax.to(topic_content, 0, {
              css: {
                y: "0%"
              }
            });
            topic_aside.show();
            TweenMax.to(topic_aside, 0, {
              css: {
                x: "0%",
                y: "0%"
              }
            });
            TweenMax.to(topic_header, 0, {
              css: {
                x: "0px",
                y: "0px"
              }
            });
            new_topic.addClass('active next-active');
            return TweenMax.to(old_topic_aside, .4, {
              css: {
                x: "100%"
              },
              ease: $.bez([0.250, 0.460, 0.450, 0.940]),
              onComplete: (function(_this) {
                return function() {
                  old_topic_aside.hide();
                  TweenMax.to(old_topic_content, .4, {
                    css: {
                      y: "100%"
                    },
                    ease: $.bez([0.250, 0.460, 0.450, 0.940])
                  });
                  return TweenMax.to(old_topic_header, .3, {
                    css: {
                      y: "0"
                    },
                    onComplete: function() {
                      $('.js-topic-header-pager').removeClass('hidden').addClass('active');
                      $('.topic.prev-active').removeClass('prev-active');
                      $('#js-topic-over-filter').removeClass('active--back');
                      return TweenMax.to(old_topic_header, .6, {
                        css: {
                          y: "0"
                        },
                        onComplete: function() {
                          var topic_triangles_id;
                          new_topic.removeClass('next-active');
                          App.watch_end_topic();
                          if ($(window).innerWidth() > 1024) {
                            topic_triangles_id = topic_aside.find('.js-bg-triangle').attr('id');
                            root.panel_triangles[0] = new TrianglesLife(topic_triangles_id);
                            return root.panel_triangles[0].start();
                          }
                        }
                      });
                    }
                  });
                };
              })(this)
            });
          } else {
            TweenMax.to(topic_content, 0, {
              css: {
                x: "0%",
                y: "100%"
              }
            });
            TweenMax.to(topic_aside, 0, {
              css: {
                x: "100%",
                y: "0%"
              }
            });
            topic_aside.hide();
            TweenMax.to(topic_header, 0, {
              css: {
                x: "0px",
                y: "0px"
              }
            });
            new_topic.addClass('active');
            $('#js-topic-over-filter').addClass('active');
            return TweenMax.to(topic_content, .4, {
              css: {
                y: "0%"
              },
              ease: $.bez([0.250, 0.460, 0.450, 0.940]),
              onComplete: (function(_this) {
                return function() {
                  topic_aside.show();
                  return TweenMax.to(topic_aside, .6, {
                    css: {
                      x: "0%"
                    },
                    ease: $.bez([0.250, 0.460, 0.450, 0.940]),
                    onComplete: function() {
                      var topic_triangles_id;
                      TweenMax.to($('.topic.prev-active .topic-aside-wrapper'), 0, {
                        css: {
                          y: "-100%"
                        }
                      });
                      TweenMax.to($('.topic.prev-active .topic-content-wrapper'), 0, {
                        css: {
                          y: "100%"
                        }
                      });
                      $('.topic.prev-active').removeClass('prev-active');
                      $('.js-topic-header-pager').removeClass('hidden').addClass('active');
                      $('#js-topic-over-filter').removeClass('active');
                      App.watch_end_topic();
                      if ($(window).innerWidth() > 1024) {
                        topic_triangles_id = topic_aside.find('.js-bg-triangle').attr('id');
                        root.panel_triangles[0] = new TrianglesLife(topic_triangles_id);
                        return root.panel_triangles[0].start();
                      }
                    }
                  });
                };
              })(this)
            });
          }
        } else {
          new_topic.scrollTop(0);
          TweenMax.to(topic_content, 0, {
            css: {
              x: "0%",
              y: "650px"
            }
          });
          topic_aside.show();
          TweenMax.to(topic_aside, 0, {
            css: {
              x: "0%",
              y: "100%"
            }
          });
          TweenMax.to(topic_header, .3, {
            css: {
              x: "0%",
              y: "0%"
            }
          });
          new_topic.addClass('active');
          $('#js-topic-over-filter').addClass('active');
          TweenMax.to(topic_content, .4, {
            css: {
              y: "0%"
            },
            ease: $.bez([0.250, 0.460, 0.450, 0.940])
          });
          return TweenMax.to(topic_aside, .4, {
            css: {
              y: "0%"
            },
            ease: $.bez([0.250, 0.460, 0.450, 0.940]),
            onComplete: (function(_this) {
              return function() {
                TweenMax.to($('.topic.prev-active .topic-aside-wrapper'), 0, {
                  css: {
                    y: "-100%"
                  }
                });
                TweenMax.to($('.topic.prev-active .topic-content-wrapper'), 0, {
                  css: {
                    y: "100%"
                  }
                });
                $('.topic.prev-active').removeClass('prev-active');
                $('.js-topic-header-pager').removeClass('hidden').addClass('active');
                $('#js-topic-over-filter').removeClass('active');
                return App.watch_end_topic();
              };
            })(this)
          });
        }
      } else {
        $(".topic[data-topic-slug=" + topic_slug + "]").addClass('active');
        topic_header = $('.topic.active .topic-header-wrapper');
        topic_aside = $('.topic.active .topic-aside-wrapper').hide();
        topic_content = $('.topic.active .topic-content-wrapper');
        topic_content.scrollTop(0);
        TweenMax.to(topic_header, 0, {
          css: {
            x: "0px",
            y: "-100px"
          }
        });
        TweenMax.to(topic_content, 0, {
          css: {
            x: "100%",
            y: "0%"
          }
        });
        TweenMax.to(topic_aside, 0, {
          css: {
            x: "100%",
            y: "0%"
          }
        });
        $('#topics').show();
        if ($(window).innerWidth() >= 1024) {
          TweenMax.to(topic_header, .3, {
            css: {
              y: "0px"
            },
            ease: $.bez([0.250, 0.460, 0.450, 0.940])
          });
          return TweenMax.to(topic_content, .4, {
            delay: .2,
            css: {
              x: "0%"
            },
            ease: $.bez([0.250, 0.460, 0.450, 0.940]),
            onComplete: (function(_this) {
              return function() {
                topic_aside.show();
                return TweenMax.to(topic_aside, .6, {
                  css: {
                    x: "0%"
                  },
                  ease: $.bez([0.250, 0.460, 0.450, 0.940]),
                  onComplete: function() {
                    var topic_triangles_id;
                    $('.js-topic-header-pager').removeClass('hidden').addClass('active');
                    App.watch_end_topic();
                    if ($(window).innerWidth() > 1024) {
                      topic_triangles_id = topic_aside.find('.js-bg-triangle').attr('id');
                      root.panel_triangles[0] = new TrianglesLife(topic_triangles_id);
                      return root.panel_triangles[0].start();
                    }
                  }
                });
              };
            })(this)
          });
        } else {
          TweenMax.to(topic_header, .3, {
            css: {
              y: "0%"
            },
            ease: $.bez([0.250, 0.460, 0.450, 0.940])
          });
          TweenMax.to(topic_content, .4, {
            delay: .3,
            css: {
              x: "0%"
            },
            ease: $.bez([0.250, 0.460, 0.450, 0.940])
          });
          topic_aside.show();
          return TweenMax.to(topic_aside, .4, {
            delay: .2,
            css: {
              x: "0%"
            },
            ease: $.bez([0.250, 0.460, 0.450, 0.940]),
            onComplete: (function(_this) {
              return function() {
                $('.js-topic-header-pager').removeClass('hidden').addClass('active');
                return App.watch_end_topic();
              };
            })(this)
          });
        }
      }
    },
    watch_end_topic: function() {
      var controller, topic_scene;
      $('.topic.active .js-topic-next').show();
      if ($(window).innerWidth() >= 1024) {
        controller = new ScrollMagic.Controller;
        return topic_scene = new ScrollMagic.Scene({
          triggerElement: '.topic.active .topic-content',
          triggerHook: 'onEnter',
          offset: $('.topic.active .topic-content').innerHeight() - 50
        }).setClassToggle(".topic.active .js-topic-next", "active").addTo(controller);
      }
    },
    close_topics: function() {
      var j, len, panel_triangle, ref, topic_aside, topic_content, topic_header;
      $('html, body').removeClass('topic_active');
      topic_header = $('.topic .topic-header-wrapper');
      topic_aside = $('.topic.active .topic-aside-wrapper');
      topic_content = $('.topic.active .topic-content-wrapper');
      if ($(window).innerWidth() > 1024 && $('canvas[width]').length > 0) {
        ref = root.panel_triangles;
        for (j = 0, len = ref.length; j < len; j++) {
          panel_triangle = ref[j];
          panel_triangle.kill();
        }
        root.panel_triangles = [];
      }
      if ($(window).innerWidth() >= 1024) {
        return TweenMax.to(topic_aside, .4, {
          css: {
            x: "100%"
          },
          ease: $.bez([0.250, 0.460, 0.450, 0.940]),
          onComplete: (function(_this) {
            return function() {
              topic_aside.hide();
              TweenMax.to(topic_content, .4, {
                css: {
                  y: "100%"
                },
                ease: $.bez([0.250, 0.460, 0.450, 0.940])
              });
              return TweenMax.to(topic_header, .3, {
                css: {
                  y: "-100px"
                },
                ease: $.bez([0.250, 0.460, 0.450, 0.940]),
                onComplete: function() {
                  $('.topic').removeClass('prev-active active');
                  return $('#topics').hide();
                }
              });
            };
          })(this)
        });
      } else {
        $('.topic.active .js-topic-next').hide();
        TweenMax.to(topic_header, .3, {
          css: {
            y: "-100px"
          },
          ease: $.bez([0.250, 0.460, 0.450, 0.940])
        });
        TweenMax.to(topic_content, .4, {
          delay: .2,
          css: {
            x: "100%"
          },
          ease: $.bez([0.250, 0.460, 0.450, 0.940])
        });
        return TweenMax.to(topic_aside, .4, {
          delay: .2,
          css: {
            x: "100%"
          },
          ease: $.bez([0.250, 0.460, 0.450, 0.940]),
          onComplete: (function(_this) {
            return function() {
              var panels;
              topic_aside.hide();
              $('.topic').removeClass('prev-active active');
              $('#topics').hide();
              panels = $('.js-panel');
              return panels.each(function(key, panel) {
                var panel_id;
                if ($(panel).offset().top > $(window).scrollTop()) {
                  panel_id = '#' + $(panel).attr('id');
                  App.scroll_to_panel($(panel_id).attr('data-panel-id'), panel_id);
                  return false;
                }
              });
            };
          })(this)
        });
      }
    }
  };

  Gallery = {
    init: function() {
      $('.gallery').each(function() {
        var gallery;
        gallery = $(this);
        if (gallery.find('.cycle-slide').length === 0) {
          if (gallery['cycle']) {
            return gallery.cycle({
              swipe: "true",
              swipeFx: "scrollHorz",
              fx: "scrollHorz",
              loader: "wait",
              easing: $.bez([0.165, 0.84, 0.44, 1]),
              slides: "> figure",
              caption: gallery.find('.gallery-caption'),
              prev: gallery.find('.gallery-prev'),
              next: gallery.find('.gallery-next'),
              autoHeight: "container",
              timeout: 0,
              speed: "1000"
            });
          }
        }
      });
      return $('.js-btn-media').fancybox({
        openEffect: 'none',
        closeEffect: 'none',
        width: 3000,
        height: 2000,
        fitToView: true,
        autoSize: true,
        padding: 0,
        margin: 0,
        type: 'media',
        helpers: {
          media: {}
        }
      });
    }
  };

  Responsive = {
    init: function() {
      var desktop_started, mobile_started, tablet_started;
      mobile_started = false;
      tablet_started = false;
      desktop_started = false;
      $(window).on('resize', function() {
        if ($(window).innerWidth() <= 768) {
          desktop_started = false;
          tablet_started = false;
          if (mobile_started === false) {
            mobile_started = true;
            return Responsive.mobile();
          }
        } else if ($(window).innerWidth() <= 1180) {
          mobile_started = false;
          desktop_started = false;
          if (tablet_started === false) {
            tablet_started = true;
            return Responsive.tablet();
          }
        } else {
          mobile_started = false;
          tablet_started = false;
          if (desktop_started === false) {
            desktop_started = true;
            return Responsive.desktop(false);
          }
        }
      }).triggerHandler('resize');
      return $('#js-menu-toggle, #js-menu-bg').on('click', function(e) {
        e.preventDefault();
        if ($('#js-menu-toggle').hasClass('opened')) {
          return App.close_menu();
        } else {
          return App.show_menu();
        }
      });
    },
    mobile: function() {
      var j, len, panel_triangle, ref;
      if ($('#js-highlights-carousel').hasClass('slick-initialized')) {
        $('#js-highlights-carousel').slick('unslick');
      }
      $('.js-highlights-filters').off('click');
      $('.js-panel, .js-panels-nav, .js-panels-sections').off('DOMMouseScroll mousewheel');
      $('html').off('keydown');
      $('.js-highlights-filters').on('click', function(e) {
        var filter;
        e.preventDefault();
        $('.js-highlights-filters').removeClass('active');
        $(this).addClass('active');
        filter = $(this).attr('data-filter');
        if (filter === 'all') {
          $('.highlights-item').show();
        } else {
          $('.highlights-item:not(".' + filter + '")').hide();
          $('.highlights-item.' + filter).show();
        }
        $('#js-highlights-filters-toggle i').toggle();
        return $('#js-highlights-filters-list').slideToggle({
          duration: 400,
          easing: $.bez([0.165, 0.84, 0.44, 1])
        });
      });
      if ($('canvas[width]').length > 0) {
        ref = root.panel_triangles;
        for (j = 0, len = ref.length; j < len; j++) {
          panel_triangle = ref[j];
          panel_triangle.kill();
        }
        root.panel_triangles = [];
      }
      return App.show_toolbar();
    },
    tablet: function() {
      var j, len, panel_triangle, ref;
      if ($('canvas[width]').length > 0) {
        ref = root.panel_triangles;
        for (j = 0, len = ref.length; j < len; j++) {
          panel_triangle = ref[j];
          panel_triangle.kill();
        }
        root.panel_triangles = [];
      }
      App.show_toolbar();
      return Responsive.desktop(true);
    },
    desktop: function(small) {
      var topic_triangles_id;
      if (small) {
        $('.js-panel, .js-panels-nav, .js-panels-sections').off('DOMMouseScroll mousewheel');
        $('html').off('keydown');
      } else {
        App.force_panels_scrolling();
        if ($('.topic.active').length > 0) {
          topic_triangles_id = $('.topic.active .js-bg-triangle').attr('id');
          root.panel_triangles[0] = new TrianglesLife(topic_triangles_id);
          root.panel_triangles[0].start();
        }
      }
      if (!$('#js-highlights-carousel').hasClass('slick-initialized')) {
        $('#js-highlights-carousel').slick({
          lazyLoad: 'ondemand',
          arrows: true,
          infinite: false,
          autoplay: false,
          slidesToShow: 3,
          slidesToScroll: 3,
          variableWidth: true,
          responsive: [
            {
              breakpoint: 1270,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 2
              }
            }, {
              breakpoint: 960,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 2
              }
            }, {
              breakpoint: 768,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1
              }
            }, {
              breakpoint: 320,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1
              }
            }
          ]
        });
      }
      $('#js-highlights-carousel').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        return $('.js-highlights-month-filters').removeClass('active');
      });
      $('.js-highlights-filters').on('click', function(e) {
        var filter;
        e.preventDefault();
        $('.js-highlights-filters').removeClass('active');
        $(this).addClass('active');
        filter = $(this).attr('data-filter');
        if (filter === 'all') {
          return $('#js-highlights-carousel').slick('slickUnfilter');
        } else {
          return $('#js-highlights-carousel').slick('slickFilter', '.highlights-item.' + filter);
        }
      });
      return $('.js-highlights-month-filters').on('click', function(e) {
        var month;
        e.preventDefault();
        $('.js-highlights-month-filters').removeClass('active');
        $(this).addClass('active');
        month = $(this).attr('data-filter');
        if ($('.highglights-item[data-month-sep="' + month + '"]')) {
          return $('#js-highlights-carousel').slick('slickGoTo', $('.highlights-item[data-month-sep="' + month + '"]').attr('data-slick-index'));
        }
      });
    }
  };

  Share = {
    FACEBOOK_SHARE_URL: 'https://www.facebook.com/sharer/sharer.php',
    TWITTER_SHARE_URL: 'https://twitter.com/intent/tweet',
    init: function() {
      if (!($('#fb-root').length > 0)) {
        $('body').append("<div id='fb-root'></div>");
      }
      this.init_facebook();
      return this.init_twitter();
    },
    init_facebook: function() {
      return $(document).on('click', '[data-share-facebook]', (function(_this) {
        return function(e) {
          var $this, left, link, top, url;
          e.preventDefault();
          $this = $(e.currentTarget);
          left = (screen.width / 2) - 400.;
          top = (screen.height / 2) - 200.;
          link = $this.data('share-url');
          url = _this.FACEBOOK_SHARE_URL + "?u=" + link;
          window.open(url, '_blank', 'width=800,height=400,top=#{top},left=#{left}');
          return false;
        };
      })(this));
    },
    init_twitter: function() {
      return $(document).on('click', '[data-share-twitter]', (function(_this) {
        return function(e) {
          var $this, left, link, text, top, url;
          e.preventDefault();
          $this = $(e.currentTarget);
          left = (screen.width / 2) - 400.;
          top = (screen.height / 2) - 200.;
          link = $this.data('share-url');
          text = $this.data('share-text');
          url = _this.TWITTER_SHARE_URL + "?text=" + text + "&url=" + link + "&original_referer=" + link;
          window.open(url, '_blank', "width=800,height=400,top=" + top + ",left=" + left);
          return false;
        };
      })(this));
    }
  };

}).call(this);
