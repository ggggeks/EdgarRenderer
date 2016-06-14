/*
 * App_Find
 * The Find object handles everything in the left pane that is used to find things. (Highlight, Filter, Search etc)
 * Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 * */
var _filterList = [];
var _dataList = ['Amounts Only', 'Text Only', 'Calculations Only', 'Negatives Only', 'Additional Items Only'];
var _tagList = ['Standard Only', 'Custom Only'];
var App_Find = {
    init:function() {
		$('.dropdown-submenu > a').submenupicker();

		$("#settings-modal").draggable({
		    handle: ".modal-header"
		});
		$("#highlight-data-modal").draggable({
		    handle: ".modal-header"
		});
		$("#highlight-concept-modal").draggable({
		    handle: ".modal-header"
		});
		$("#selection-detail-container").draggable({
            handle: ".selection-detail-header"
        });
		$("#filter-period-modal").draggable({
		    handle: ".modal-header"
		});
		$("#filter-unit-modal").draggable({
		    handle: ".modal-header"
		});
		$("#filter-axis-modal").draggable({
			handle : ".modal-header"
		});
		$("#filter-scale-modal").draggable({
			handle : ".modal-header"
		});
		$("#filter-balance-modal").draggable({
			handle : ".modal-header"
		});
		
		$("#about-modal").draggable({
			handle : ".about-header"
		});

		App_Find.Highlight.init();
		App_Find.Filter.init();
		App_Find.Breadcrumb.init();
		App_Find.Search.init();
		App_Find.TaggedSection.init();
		App_Find.Results.init();
		App_Find.Element.init();
		App_Find.Settings.init();
		$("#selection-detail-container").dialog({
			autoOpen : false
		});
		
		$("#about-modal").dialog({
			autoOpen : false
		});
	},
	resetUI : function() {

        App_Find.Highlight.resetUI();
        App_Find.Filter.resetUI();
        App_Find.Search.resetUI();
        App_Find.Breadcrumb.resetUI();
        App_Find.Results.resetUI();
        App_Find.Element.resetUI();
    },
    removeHighlightFilter:function() {

        App.frame.contents().find('.sec-cbe-highlight-filter').removeClass('sec-cbe-highlight-filter');
    },
    Highlight:{
        cachedResults:{
            both:$(),
            amount:$(),
            text:$(),
            calculation:$(),
            negative:$(),
            sign:$(),
            hidden:$()
        },
        init:function() {

            // change highlight type or concept type
            $('#highlight-data-modal').find('input[type="radio"]').on('change', function() {

                App.showSpinner($('.modal-header'), function() {

                    App_Find.Highlight.refresh();
                    App.hideSpinner();
                });
            });
            // change highlight type or concept type
            $('#highlight-concept-modal').find('input[type="radio"]').on('change', function() {

                App.showSpinner($('.modal-header'), function() {

                    App_Find.Highlight.refresh();
                    App.hideSpinner();
                });
            });
        },
        resetUI:function() {

            App_Find.Highlight.cachedResults.both = $();
            App_Find.Highlight.cachedResults.amount = $();
            App_Find.Highlight.cachedResults.text = $();
            App_Find.Highlight.cachedResults.calculation = $();
            App_Find.Highlight.cachedResults.negative = $();
            App_Find.Highlight.cachedResults.sign = $();
            App_Find.Highlight.cachedResults.hidden = $();

            // reset radio buttons
            var modal = $('#highlight-data-modal');
            modal.find('input[name="highlight-elements"]:first').prop('checked', true);
            var modal1 = $('#highlight-concept-modal');
            modal1.find('input[name="highlight-concepts"]:first').prop('checked', true);
        },
        reset:function() {

            var modal = $('#highlight-data-modal');
            modal.find('input[name="highlight-elements"]:first').prop('checked', true);
            var modal1 = $('#highlight-concept-modal');
            modal1.find('input[name="highlight-concepts"]:first').prop('checked', true);
        },
        resetData:function() {

            var modal = $('#highlight-data-modal');
            modal.find('input[name="highlight-elements"]:first').prop('checked', true);
        },
        resetConcepts:function() {

            var modal = $('#highlight-concept-modal');
            modal.find('input[name="highlight-concepts"]:first').prop('checked', true);
        },
        highlight:function() {
 
            App.frame.contents().find('.sec-cbe-highlight-dashed').removeClass('sec-cbe-highlight-dashed');
            var highlightType = App_Find.Highlight.getSelected().value;
            var results = App_Find.Highlight.getResults();
            var instance = App.InlineDoc.getMetaData();
            
            if (highlightType != 'none') {

                if (results.length == 0) {
	                if (highlightType == 'calculation') {
	                	if (instance) {
	                		tags = instance.tag;
	                		for (id in tags) {
	                			tag = tags[id];
	                			if (tag.calculation) {
	                				var nodes = App.InlineDoc.getElementByName(id.replace('_', ':'));
	                				nodes.each(function (index, element) {
	                                    var node = $(element);
	                                    if (!node.hasDimensions()) {
	                                        results.push(node);
	                                    }
	                				})
	                			}
	                		}
	                	}
	                    App_Find.Highlight.cachedResults[highlightType] = results;
	                } else {
	
	                    var inlineHighlightTypes;
	                    switch (highlightType) {
	                        case 'both':
	                            inlineHighlightTypes = ['nonFraction', 'nonNumeric'];
	                            break;
	                        case 'amount':
	                            inlineHighlightTypes = ['nonFraction'];
	                            break;
	                        case 'text':
	                            inlineHighlightTypes = ['nonNumeric'];
	                            break;
	                        case 'hidden':
	                            inlineHighlightTypes = ['hidden'];
	                            break;
	                        case 'negative':
	                            inlineHighlightTypes = ['negative'];
	                            break;
	                        case 'sign':
	                            inlineHighlightTypes = ['sign'];
	                            break;
	                    }
	                    App_Find.Highlight.cachedResults[highlightType] = App.InlineDoc.getElementsByType(inlineHighlightTypes, true);
	                    results = App_Find.Highlight.cachedResults[highlightType];
	                }
	            }
	            App_Find.Results.load();
	            if(!App_Find.TaggedSection.isInitialized){
	            	App_Find.TaggedSection.load();
	            }
            }
        },
        getResults:function() {

            var selected = App_Find.Highlight.getSelected();
            return selected.value == 'none' ? $() : App_Find.Highlight.cachedResults[selected.value];
        },
        getSelected:function() {

            var modal1 = $('#highlight-data-modal');
            var highlightRadio = modal1.find('input[name="highlight-elements"]:checked');
            var modal2 = $('#highlight-concept-modal');
            var conceptsRadio = modal2.find('input[name="highlight-concepts"]:checked');
            return {
                value:highlightRadio.val(),
                label:highlightRadio.parent().text().trim(),
                conceptValue:conceptsRadio.val(),
                conceptLabel:conceptsRadio.parent().text().trim()
            }
        },
        refresh:function() {

            App_Find.Filter.updateSelectedCounts();
            App_Find.Breadcrumb.refresh();
            App_Find.Highlight.highlight();
        },
        refreshData:function() {

            App_Find.Filter.updateSelectedCounts();
            App_Find.Breadcrumb.refresh();
            App_Find.Highlight.highlight();
        },
        refreshConcepts:function() {

            App_Find.Filter.updateSelectedCounts();
            App_Find.Breadcrumb.refresh();
            App_Find.Highlight.highlight();
        },
        refreshPeriod:function() {

            App_Find.Filter.updateSelectedCounts();
            App_Find.Breadcrumb.refresh();
            App_Find.Highlight.highlight();
        },
        refreshUnits:function() {

            App_Find.Filter.updateSelectedCounts();
            App_Find.Breadcrumb.refresh();
            App_Find.Highlight.highlight();
        },
        refreshAxis:function() {

            App_Find.Filter.updateSelectedCounts();
            App_Find.Breadcrumb.refresh();
            App_Find.Highlight.highlight();
        },
        refreshScale:function() {

            App_Find.Filter.updateSelectedCounts();
            App_Find.Breadcrumb.refresh();
            App_Find.Highlight.highlight();
        },
        refreshBalance:function() {

            App_Find.Filter.updateSelectedCounts();
            App_Find.Breadcrumb.refresh();
            App_Find.Highlight.highlight();
        }
    },
    Filter:{
        init:function() {

            var modal = $('#filter-period-modal');
            modal.on('shown.bs.modal', function (e) {

                var content = $(e.currentTarget);
                if (content.attr('data-contents-loaded') == 'false') {

                    content.attr('data-contents-loaded', 'true');
                    App_Find.Filter.loadCalendars();

                    // hide all the years except for the first year
                    content.find('div[data-calendar-year]').each(function(index, element) {

                        var year = $(element).attr('data-calendar-year');
                        if (index == 0) {

                            App_Find.Filter.showCalendarTree(year);
                        } else {

                            App_Find.Filter.hideCalendarTree(year);
                        }
                    });

                    // wire up the checkboxes
                    content.find('input[type=checkbox]').on('change', function() {

                        var checkbox = $(this);
                        var checkboxContainer = checkbox.parents('div[class="checkbox"]');
                        
                        var modal1 = $('#settings-modal');

                            if (checkboxContainer.attr('data-calendar-year')) {

                                var checked = checkboxContainer.find('input').prop('checked');
                                content.find('div[data-calendar-item="' + checkboxContainer.attr('data-calendar-year') + '"]').each(function (index, element) {

                                    $(element).find('input').prop('checked', checked);
                                });
                            } else {

                                var year = checkboxContainer.attr('data-calendar-item');
                                if (checkbox.is(':checked')) {

                                    var allChecked = true;
                                    content.find('div[data-calendar-item="' + year + '"]').each(function() {

                                        if (!$(this).find('input').is(':checked')) {

                                            allChecked = false;
                                            return false;
                                        }
                                    });

                                    if (allChecked) {

                                        var containerParent = content.find('div[data-calendar-year="' + year + '"]');
                                        containerParent.find('input').prop('checked', true);
                                    }
                                } else {

                                    var containerParent = content.find('div[data-calendar-year="' + year + '"]');
                                    containerParent.find('input').prop('checked', false);
                                }
                            }
                        App.showSpinner($('.modal-header'), function() {

		                    App_Find.Filter.updateSelectedCounts();
	                        App_Find.Breadcrumb.refresh();
	                        App_Find.Highlight.highlight();
		                    App.hideSpinner();
		                });
                    });

                    // wire up the expand/collapse icons
                    content.find('div[data-calendar-year] span').on('click', function() {

                        var node = $(this);
                        var year = node.parents('div[data-calendar-year]');
                        year = year.attr('data-calendar-year');
                        if (node.hasClass('glyphicon-plus')) {

                            App_Find.Filter.showCalendarTree(year);
                        } else {

                            App_Find.Filter.hideCalendarTree(year);
                        }
                    });
                    
                    
                    content.find('div[data-calendar-year] span').bind('keyup', function(e) {                    	
        				var code = e.keyCode || e.which;
        				if((code == 13) || (code == 32)) { //Enter keycode
        					// toggle icon
        				  	e.preventDefault();
        				  	$(this).click();
        				}
        			});
                    
                }
            });
            
            var modalAxis = $('#filter-axis-modal');
            modalAxis.on('shown.bs.modal', function (e) {
				
                var content = $(e.currentTarget);
                if (content.attr('data-contents-loaded') == 'false') {

                    content.attr('data-contents-loaded', 'true');
                    App_Find.Filter.loadAxis();
                    // wire up the checkboxes
                    content.find('input[type=checkbox]').on('change', function() {
                        var checkbox = $(this);
                        var checkboxContainer = checkbox.parents('div[class="checkbox"]');
                        App.showSpinner($('.modal-header'), function() {

		                    App_Find.Filter.updateSelectedCounts();
	                        App_Find.Breadcrumb.refresh();
	                        App_Find.Highlight.highlight();
		                    App.hideSpinner();
		                });
                    });

                    // wire up the expand/collapse icons
                    content.find('div[data-calendar-year] span').on('click', function() {

                        var node = $(this);
                        var year = node.parents('div[data-calendar-year]');
                        year = year.attr('data-calendar-year');
                        if (node.hasClass('glyphicon-plus')) {

                            App_Find.Filter.showCalendarTree(year);
                        } else {

                            App_Find.Filter.hideCalendarTree(year);
                        }
                    });
                }
            });

            var modalScale = $('#filter-scale-modal');
            modalScale.on('shown.bs.modal', function (e) {

                var content = $(e.currentTarget);
                if (content.attr('data-contents-loaded') == 'false') {

                    content.attr('data-contents-loaded', 'true');
                    App_Find.Filter.loadScale();

                    // wire up the checkboxes
                    content.find('input[type=checkbox]').on('change', function() {

                        var checkbox = $(this);
                        var checkboxContainer = checkbox.parents('div[class="checkbox"]');

						App.showSpinner($('.modal-header'), function() {

		                    App_Find.Filter.updateSelectedCounts();
	                        App_Find.Breadcrumb.refresh();
	                        App_Find.Highlight.highlight();
		                    App.hideSpinner();
		                });
		                
                    });

                    // wire up the expand/collapse icons
                    content.find('div[data-calendar-year] span').on('click', function() {

                        var node = $(this);
                        var year = node.parents('div[data-calendar-year]');
                        year = year.attr('data-calendar-year');
                        if (node.hasClass('glyphicon-plus')) {

                            App_Find.Filter.showCalendarTree(year);
                        } else {

                            App_Find.Filter.hideCalendarTree(year);
                        }
                    });
                }
            });
            
            var modalBalance = $('#filter-balance-modal');
            modalBalance.on('shown.bs.modal', function (e) {

                var content = $(e.currentTarget);

                // wire up the checkboxes
                content.find('input[type=checkbox]').on('change', function() {
					
                    var checkbox = $(this);
                    var checkboxContainer = checkbox.parents('div[class="checkbox"]');
				
                    App.showSpinner($('.modal-header'), function() {
						App_Find.Filter.updateSelectedCounts();
                    	App_Find.Breadcrumb.refresh();
	                    App_Find.Highlight.refresh();
	                    App.hideSpinner();
	                });
                });

                // wire up the expand/collapse icons
                content.find('div[data-calendar-year] span').on('click', function() {

                    var node = $(this);
                    var year = node.parents('div[data-calendar-year]');
                    year = year.attr('data-calendar-year');
                    if (node.hasClass('glyphicon-plus')) {

                        App_Find.Filter.showCalendarTree(year);
                    } else {

                        App_Find.Filter.hideCalendarTree(year);
                    }
                });
            });
            
            var modalUnit = $('#filter-unit-modal');
            modalUnit.on('shown.bs.modal', function (e) {

                var content = $(e.currentTarget);
                if (content.attr('data-contents-loaded') == 'false') {

                    content.attr('data-contents-loaded', 'true');
                    App_Find.Filter.loadUnits();

                    // wire up the checkboxes
                    content.find('input[type=checkbox]').on('change', function() {

                        var checkbox = $(this);
                        var checkboxContainer = checkbox.parents('div[class="checkbox"]');
                        
                        App.showSpinner($('.modal-header'), function() {

		                    App_Find.Filter.updateSelectedCounts();
	                        App_Find.Breadcrumb.refresh();
	                        App_Find.Highlight.highlight();
		                    App.hideSpinner();
		                });
                    });

                    // wire up the expand/collapse icons
                    content.find('div[data-calendar-year] span').on('click', function() {

                        var node = $(this);
                        var year = node.parents('div[data-calendar-year]');
                        year = year.attr('data-calendar-year');
                        if (node.hasClass('glyphicon-plus')) {

                            App_Find.Filter.showCalendarTree(year);
                        } else {

                            App_Find.Filter.hideCalendarTree(year);
                        }
                    });
                }
            });
        },
        resetUI:function() {

            var modal = $('#filter-period-modal');
            modal.attr('data-contents-loaded', 'false');
            modal.attr('data-prev-highlight-type', '');
            modal.find('span[data-calendars-showing]').html('0');
            modal.find('span[data-calendars-total-items]').html('0');
            modal.find('div[data-calendars-content]').html('');
            
            
            var modal = $('#filter-unit-modal');
            modal.attr('data-contents-loaded', 'false');
            modal.attr('data-prev-highlight-type', '');
            modal.find('span[data-units-showing]').html('0');
            modal.find('span[data-units-total-items]').html('0');
            modal.find('div[data-units-content]').html('');
            
            var modal = $('#filter-axis-modal');
            modal.attr('data-contents-loaded', 'false');
            modal.attr('data-prev-highlight-type', '');
            modal.find('span[data-axis-showing]').html('0');
            modal.find('span[data-axis-total-items]').html('0');
            modal.find('div[data-axis-content]').html('');

            var modal = $('#filter-scale-modal');
            modal.attr('data-contents-loaded', 'false');
            modal.attr('data-prev-highlight-type', '');
            modal.find('span[data-scale-showing]').html('0');
            modal.find('span[data-scale-total-items]').html('0');
            modal.find('div[data-scale-content]').html('');
        },
        reset:function() {

            // uncheck periods
            App_Find.Filter.getCalendarItemsChecked(true).each(function(index, element) {

                $(element).prop('checked', false);
            });

            // uncheck units
            App_Find.Filter.getUnitItemsChecked().each(function(index, element) {

                $(element).prop('checked', false);
            });
            
             // uncheck axis
            App_Find.Filter.getAxisItemsChecked().each(function(index, element) {

                $(element).prop('checked', false);
            });

            //uncheck scale
            App_Find.Filter.getScaleItemsChecked().each(function(index, element) {

                $(element).prop('checked', false);
            });
            
            //uncheck balance
            App_Find.Filter.getBalanceItemsChecked().each(function(index, element) {

                $(element).prop('checked', false);
            });
        },
        resetPeriod:function() {

            // uncheck periods
            App_Find.Filter.getCalendarItemsChecked(true).each(function(index, element) {

                $(element).prop('checked', false);
            });

        },
        resetUnits:function() {

            // uncheck units
            App_Find.Filter.getUnitItemsChecked().each(function(index, element) {

                $(element).prop('checked', false);
            });
        },
        loadUnits:function() {

            var totalFound = 0;
            var modal = $('#filter-unit-modal');
            var content = modal.find('div[data-units-content]');
            var items = App.InlineDoc.getUnits();
            content.attr('data-units-content', 'true');
            content.html('');
            
            var idAndMeasureName = [];
            items.each(function(index, element) {

                var ele = $(element);
                var isAmount = false;
                var isText = false;
                totalFound++;
                var tempArray = [];
                tempArray.push(ele.prop('id'),ele.unitFriendlyName().toLowerCase(),ele.unitFriendlyName(),ele.attr('id'));
                idAndMeasureName.push(tempArray);
            });
            
            idAndMeasureName.sort(compareMeasureName);
            function compareMeasureName(a, b) {
                if (a[1] === b[1]) {
                    return 0;
                }
                else {
                    return (a[1] < b[1]) ? -1 : 1;
                }
            }
            
            for	(index = 0; index < idAndMeasureName.length; index++) {
            	content.append(
                    '<div class="checkbox">' +
                    '<label>' +
                    '<input type="checkbox" value="' + idAndMeasureName[index][0] +'" friendlyName="' + idAndMeasureName[index][3]+ '">' +
                    '<span style="text-transform: capitalize;">' + idAndMeasureName[index][2] + '</span>' +
                    '</label>' +
                    '</div>'
                );
            }
        
            // update the total items found
            modal.find('span[data-units-total-items]').first().html(totalFound);
        },
        getUnitItems:function() {

            return $('#filter-unit-modal').find('div[data-units-content] input[type="checkbox"]');
        },
        getUnitItemsChecked:function() {

            return $('#filter-unit-modal').find('div[data-units-content] input[type="checkbox"]:checked');
        },
        
        resetScale:function() {

            // uncheck units
            App_Find.Filter.getScaleItemsChecked().each(function(index, element) {

                $(element).prop('checked', false);
            });
        },
        
        resetBalance:function() {

            // uncheck balance
            App_Find.Filter.getBalanceItemsChecked().each(function(index, element) {

                $(element).prop('checked', false);
            });
        },
        loadScale:function() {

            var totalFound = 0;
            var modal = $('#filter-scale-modal');
            var content = modal.find('div[data-scale-content]');
            var items = App.InlineDoc.getElementsByType(['nonFraction'], true);
            content.attr('data-scale-content', 'true');
            content.html('');
            var resultscales = {};
            var resultScalesArr = [];
           
            items.each(function(index,element){
                if(element.attr('scale')){
                    var scaleValue = element.attr('scale');
                    var scaleValueName = element.scaleFriendlyName();
                    if($.inArray(scaleValue,resultScalesArr) == -1){
                        resultscales[scaleValue] = scaleValueName;
                        resultScalesArr.push(scaleValue);
                        totalFound++;
                    }
                }
            });
            resultScalesArr.sort(function(a,b){
                return b-a;
            });
            for(var i=0;i<resultScalesArr.length;i++){
                content.append(
                    '<div class="checkbox">' +
                    '<label>' +
                    '<input type="checkbox" value="' + resultScalesArr[i] + '" isAmount="' + '" friendlyName="' + resultscales[resultScalesArr[i]] + '">' +
                    '<span class="scale">' + resultscales[resultScalesArr[i]]+ " "+ '</span>' +
                    '</label>' +
                    '</div>'
                );
            }

                            // update the total items found
            modal.find('span[data-scale-total-items]').first().html(totalFound);
        },
        getScaleItems:function() {

            return $('#filter-scale-modal').find('div[data-scale-content] input[type="checkbox"]');
        },
        getScaleItemsChecked:function() {

            return $('#filter-scale-modal').find('div[data-scale-content] input[type="checkbox"]:checked');
        },
        getBalanceItems:function() {

            return $('#filter-balance-modal').find('input[type="checkbox"]');
        },
        getBalanceItemsChecked:function() {

            return $('#filter-balance-modal').find('input[type="checkbox"]:checked');
        },

        //For Axis
        resetAxis:function() {

            // uncheck units
            App_Find.Filter.getAxisItemsChecked().each(function(index, element) {

                $(element).prop('checked', false);
            });
        },

        loadAxis:function() {
			
        	var totalFound = 0;
            var modal = $('#filter-axis-modal');
            var content = modal.find('div[data-axis-content]');
            var items = App.InlineDoc.getAxis();
            content.attr('data-axis-content', 'true');
            content.html('');

            var dimensionValues = [];
            var dimensionNameAndValue = [];
            items.each(function(index, element) {

                var ele = $(element);
                var pele = $(ele.parents()[2]);

                var dimensionName = ele.attr('dimension');
                App.InlineDoc.updateContextAxis(pele.attr('id'), dimensionName);
                if($.inArray(dimensionName,dimensionValues) == -1){
                    totalFound++;
                    dimensionValues.push(dimensionName);
                    var dimensionNameMatch = dimensionName.split(":")[1].split(/(?=[A-Z])/).join(" ").replace("Axis"," ");
                    var dimensionValuestemp = [];
                    dimensionValuestemp.push(dimensionName,dimensionNameMatch.toLowerCase(),dimensionNameMatch);
                    dimensionNameAndValue.push(dimensionValuestemp);
                 }
            });
            
            dimensionNameAndValue.sort(compareDimensionName);
            function compareDimensionName(a, b) {
                if (a[1] === b[1]) {
                    return 0;
                }
                else {
                    return (a[1] < b[1]) ? -1 : 1;
                }
            }
            
            for	(index = 0; index < dimensionNameAndValue.length; index++) {
            	content.append(
                    '<div class="checkbox">' +
                    '<label>' +
                    '<input type="checkbox" value="' + dimensionNameAndValue[index][0] + '" friendlyName="' + dimensionNameAndValue[index][0].split(':')[1] + '">' +
                    '<span>' + dimensionNameAndValue[index][2] + '</span>' +
                    '</label>' +
                    '</div>'
                );
            }
            
            // update the total items found
            modal.find('span[data-axis-total-items]').first().html(totalFound);
        },
        
        filterAxisByHighlight:function() {

        },
        getAxisItems:function() {

            return $('#filter-axis-modal').find('div[data-axis-content] input[type="checkbox"]');
        },
        getAxisItemsChecked:function() {

            return $('#filter-axis-modal').find('div[data-axis-content] input[type="checkbox"]:checked');
        },
        loadCalendars:function() {

            var modal = $('#filter-period-modal');
            var content = modal.find('div[data-calendars-content]');
            var items = App.InlineDoc.getContexts();
            var periodresult = [];
            var periodhash = {};

            content.attr('data-calendars-content', 'true');
            content.html('');
            // get all the years
            var years = [];
            items.each(function(index, element) {

                var node = $(element);
                var friendlyName = node.calendarFriendlyName();
                var year = friendlyName.match(/\b\d{4}\b/gi);
                year = year[year.length - 1]; // if there are multiple years take the last one
                var idx =  $.inArray(year, years);
                if (idx == -1) {

                    years.push(year);
                }
            });

            // sort years and add the year checkboxes
            years.sort(function(a, b){return b-a});
            for(var i=0; i<years.length; i++) {

                var year = years[i];
                var yearNode = $(
                                '<div class="checkbox" data-calendar-year="' + year + '">' +
                                '<span class="glyphicon glyphicon-minus"></span>' +
                                '<label><input type="checkbox" />' + year + '</label>' +
                                '</div>'
                );
                content.append(yearNode);
            }

            // create the calendar checkboxes
            var calendars = [];
            var totalFound = 0;
            items.each(function(index, element) {

                var node = $(element);
                var friendlyName = node.calendarFriendlyName();
                var normalizedPeriod = node.normalizedPeriodString();
                var foundCalendar = false;

                if ($.inArray(friendlyName, calendars) == -1) {

                    calendars.push(friendlyName);
                    totalFound++;
                } else {

                    foundCalendar = true;
                }

				var contextid = node.prop('id');
				var flatcontext = [normalizedPeriod];
				App.InlineDoc.updateContextPeiod(contextid, flatcontext);
				
                // if we found a calendar append the id to the value
                if (!foundCalendar) {

                    var year = friendlyName.match(/\b\d{4}\b/gi);
                    year = year[year.length - 1];
                    content.find('div[data-calendar-year="' + year + '"]').after(
                        '<div class="checkbox" data-calendar-item="' + year + '">' +
                        '<label><input type="checkbox" value="' + normalizedPeriod + '" friendlyName="' + friendlyName + '">' + friendlyName + '</label>' +
                        '</div>'
                    );
                } 
            });

            // update the total items found
            modal.find('span[data-calendars-total-items]').first().html(totalFound);
        },
        getCalendarItems:function() {

            return $('#filter-period-modal').find('div[data-calendars-content] input[type="checkbox"]');
        },
        getCalendarItemsChecked:function(includeParent) {

            includeParent = includeParent ? true : false;

            return $('#filter-period-modal').find('div[data-calendars-content] input[type="checkbox"]:checked').filter(function() {

                return includeParent || !includeParent && $(this).parents('div[data-calendar-year]').length == 0;
            });
        },
        updateCalendarTreeState:function(year) {

            var isCollapsed = true;
            var modal = $('#filter-period-modal');

            modal.find('div[data-calendar-item="' + year + '"]').each(function(index, element) {

                if ($(this).css('display') == 'block') {

                    return isCollapsed = false;
                }
            });

            var divYear = modal.find('div[data-calendar-year="' + year + '"]');
            var span = divYear.find('span');
            if (isCollapsed) {

                span.removeClass('glyphicon-minus');
                span.addClass('glyphicon-plus');
                span.attr("tabindex", "0");
                span.attr("aria-label", "Expand");
            } else {

                span.removeClass('glyphicon-plus');
                span.addClass('glyphicon-minus');
                span.attr("tabindex", "0");
                span.attr("aria-label", "Collapse");
            }
        },
        hideCalendarTree:function(year) {

            if (year) {

                $('#filter-period-modal').find('div[data-calendar-item="' + year + '"]').each(function(index, element) {

                    $(element).hide();
                });
                App_Find.Filter.updateCalendarTreeState(year);
            }
        },
        showCalendarTree:function(year) {

            $('#filter-period-modal').find('div[data-calendar-item="' + year + '"]').each(function(index, element) {

                var e = $(element);
                var checkbox = e.find('input[type="checkbox"]');
                e.show();
            });
            App_Find.Filter.updateCalendarTreeState(year);
        },
        refreshCalendarTree:function() {

            $('#filter-period-modal').find('div[data-calendar-year]').each(function(index, element) {

                App_Find.Filter.showCalendarTree($(element).attr('data-calendar-year'));
            });
        },
        updateSelectedCounts:function() {

            var calendarsChecked = 0;
            App_Find.Filter.getCalendarItemsChecked().each(function(index, element) {

                calendarsChecked++;
            });

            var modal = $('#filter-period-modal');
            modal.find('span[data-calendars-checked]').html(calendarsChecked);
            var modal1= $('#filter-unit-modal');
            modal1.find('span[data-units-checked]').html(App_Find.Filter.getUnitItemsChecked().length);
            var modal2= $('#filter-axis-modal');
            modal2.find('span[data-axis-checked]').html(App_Find.Filter.getAxisItemsChecked().length);
            var modal3= $('#filter-scale-modal');
            modal3.find('span[data-scale-checked]').html(App_Find.Filter.getScaleItemsChecked().length);
            var modal4= $('#filter-balance-modal');
            modal4.find('span[data-balance-checked]').html(App_Find.Filter.getBalanceItemsChecked().length);
        },
        getSelected:function() {

            var filter = {
                conceptType:$('input[name="highlight-concepts"]:checked').val(),
                joinType:$('#settings-modal').find('input[type="radio"]:checked').val(),
                units:App_Find.Filter.getUnitItems(),
                unitsChecked:App_Find.Filter.getUnitItemsChecked(),
                unitsAreFiltered:false,
                axis:App_Find.Filter.getAxisItems(),
                axisChecked:App_Find.Filter.getAxisItemsChecked(),
                axisAreFiltered:false,
                scale:App_Find.Filter.getScaleItems(),
                scaleChecked:App_Find.Filter.getScaleItemsChecked(),
                scaleAreFiltered:false,
                balance:App_Find.Filter.getBalanceItems(),
                balanceChecked:App_Find.Filter.getBalanceItemsChecked(),
                balanceAreFiltered:false,
                calendars:App_Find.Filter.getCalendarItems(),
                calendarsChecked:App_Find.Filter.getCalendarItemsChecked(),
                calendarsAreFiltered:false,
                isFiltered:function() {

                    return (this.conceptType != 'both' || this.unitsAreFiltered || this.calendarsAreFiltered || this.axisAreFiltered || this.scaleAreFiltered|| this.balanceAreFiltered);
                }
            };

            if (filter.unitsChecked.length > 0) {

                filter.unitsAreFiltered = true;
            }

            if (filter.calendarsChecked.length > 0 &&
                filter.calendars.length != filter.calendarsChecked.length) {

                filter.calendarsAreFiltered = true;
            }
            
            if (filter.axisChecked.length > 0 ) {

                filter.axisAreFiltered = true;
            }

            if (filter.scaleChecked.length > 0) {

                filter.scaleAreFiltered = true;
            }
            
            if (filter.balanceChecked.length > 0) {

                filter.balanceAreFiltered = true;
            }

            return filter;
        }
    },
    Breadcrumb:{
        init:function() {
			/*$('#app-panel-breadcrum-container').find('span[data-btn-clearAllFilter]').on('click', function() {
				App_Find.Highlight.resetData();
				App_Find.Highlight.resetConcepts();
				App_Find.Filter.resetPeriod();
				App_Find.Filter.resetUnits();
				App_Find.Filter.resetAxis();
				App_Find.Filter.resetScale();
                App_Find.Filter.resetBalance();
                App_Find.Highlight.refresh();
            });*/
        },
        resetUI:function() {

            App_Find.Breadcrumb.refresh();
        },
        replaceNeeded:function(array, letter, str) {
        	for (var i in array) {
                if (array[i].match(letter)) {
                	array[i]=str;
                }
            }
        },
        searchFor:function(array, letter) {
        	for (var i in array) {
                if (array[i].indexOf(letter)>-1) {
                	_filterList.splice(_filterList.indexOf(array[i]),1);
                }
            }
        },
        doesExist:function(array, letter) {
        	for (var i in array) {
                if (array[i].match(letter)) {
                	return true;
                }
            }
        	return false;
        },
        refresh:function() {

            var breadcrumb = $('.breadcrumb-container');
            var highlight = App_Find.Highlight.getSelected();

            // update highlight
            var label = highlight.label;
            breadcrumb.find('span[data-breadcrumb-highlight]').html(label);
            
            if(label=="All"){
            	//$("#dataDiv").css("display", "none");
            	for(var i=0; i<_dataList.length;i++){
            		if(_filterList.indexOf(_dataList[i])!=-1)
            			_filterList.splice(_filterList.indexOf(_dataList[i]),1);
            	}
            }else{
            	//$("#dataDiv").css("display", "block");
            	if(_filterList.indexOf(label) == -1){            		
            		for(var i=0; i<_dataList.length;i++){
            			if(_filterList.indexOf(_dataList[i])!=-1)
            				_filterList.splice(_filterList.indexOf(_dataList[i]),1);
            		}
            		_filterList.push(label);            		
            	}
            }
            
            // update concepts
            var conceptLabel = highlight.conceptLabel;
            breadcrumb.find('span[data-breadcrumb-concepts]').html(conceptLabel);
            
            if(conceptLabel=="All"){
            	//$("#conceptsDiv").css("display", "none");
            	for(var i=0; i<_tagList.length;i++){
            		if(_filterList.indexOf(_tagList[i])!=-1)
            			_filterList.splice(_filterList.indexOf(_tagList[i]),1);
                 }
            }else{
            	//$("#conceptsDiv").css("display", "block");
            	if(_filterList.indexOf(conceptLabel) == -1){
            		for(var i=0; i<_tagList.length;i++){
            			if(_filterList.indexOf(_tagList[i])!=-1)
            				_filterList.splice(_filterList.indexOf(_tagList[i]),1);
            		}
            	    _filterList.push(conceptLabel);
            	}
            }
            
            // update calendar
            var calItemsText = 'All';
            var calItems = App_Find.Filter.getCalendarItemsChecked();

            if (calItems.length == 1) {

                calItemsText = calItems.parent().text().trim();
            } else if (calItems.length > 1) {

                calItemsText = '1+';
            }
            breadcrumb.find('span[data-breadcrumb-periods]').html(calItemsText);
            if(calItemsText=="All"){
            	//$("#periodsDiv").css("display", "none");
            	App_Find.Breadcrumb.searchFor(_filterList, "Periods (");
            }else{
            	//$("#periodsDiv").css("display", "block");
            	App_Find.Breadcrumb.replaceNeeded(_filterList, 'Periods', 'Periods (' +calItemsText+')');  
            	if(!App_Find.Breadcrumb.doesExist(_filterList, "Periods"))
            		_filterList.push('Periods (' +calItemsText+')');
            }

            // update units
            var unitItemsText = 'All';
            var unitItems = App_Find.Filter.getUnitItemsChecked();
            if (unitItems.length == 1) {

                unitItemsText = unitItems.parent().text().trim();
            } else if (unitItems.length > 1) {

                unitItemsText = '1+';
            }
            breadcrumb.find('span[data-breadcrumb-units]').html(unitItemsText);
            if(unitItemsText=="All"){
            	//$("#unitsDiv").css("display", "none");
            	App_Find.Breadcrumb.searchFor(_filterList, "Measures (");
            }else{
            	//$("#unitsDiv").css("display", "block");
            	App_Find.Breadcrumb.replaceNeeded(_filterList, 'Measures', 'Measures (' +unitItemsText+')');  
            	if(!App_Find.Breadcrumb.doesExist(_filterList, "Measures"))
            		_filterList.push('Measures ('+unitItemsText+')');
            }
            if((label=="All")&&(conceptLabel=="All")&&(calItemsText=="All")&&(unitItemsText=="All")){
            	$("#app-panel-breadcrum-container").css("display", "none");
            	$("#app-inline-xbrl-doc").css("top","0px");
            	$("#app-panel").css("top","25px");
            	$("#app-panel1").css("top","25px");
            	$("#app-panel2").css("top","25px");
                $("#app-container").css("height","95%");
            }else{
            	$("#app-panel-breadcrum-container").css("display", "block");
            	if($("#filterDataDiv").height()==23){
                	$("#app-panel").css("top","55px");
                	$("#app-panel1").css("top","55px");
                	$("#app-panel2").css("top","55px");
                	$("#app-inline-xbrl-doc").css("top","25px");
                    $("#app-container").css("height","90%");
                    $("#app-panel-breadcrum-container").css("height", "25px");
                }else if($("#filterDataDiv").height()==46){
                	$("#app-panel-breadcrum-container").css("height", "50px");
                	$("#app-inline-xbrl-doc").css("top","50px");
                	$("#app-panel").css("top","80px");
                	$("#app-panel1").css("top","80px");
                	$("#app-panel2").css("top","80px");
                    $("#app-container").css("height","85%");
                }else if($("#filterDataDiv").height()==69){
                	$("#app-panel-breadcrum-container").css("height", "75px");
                	$("#app-inline-xbrl-doc").css("top","75px");
                	$("#app-panel").css("top","105px");
                	$("#app-panel1").css("top","105px");
                	$("#app-panel2").css("top","105px");
                    $("#app-container").css("height","80%");
                }else if($("#filterDataDiv").height()==92){
                	$("#app-panel-breadcrum-container").css("height", "100px");
                	$("#app-inline-xbrl-doc").css("top","100px");
                	$("#app-panel").css("top","130px");
                	$("#app-panel1").css("top","130px");
                	$("#app-panel2").css("top","130px");
                    $("#app-container").css("height","75%");
                }else if($("#filterDataDiv").height()==115){
                	$("#app-panel-breadcrum-container").css("height", "125px");
                	$("#app-inline-xbrl-doc").css("top","125px");
                	$("#app-panel").css("top","155px");
                	$("#app-panel1").css("top","155px");
                	$("#app-panel2").css("top","155px");
                    $("#app-container").css("height","70%");
                }else{
                	$("#app-panel").css("top","55px");
                	$("#app-panel1").css("top","55px");
                	$("#app-panel2").css("top","55px");
                	$("#app-inline-xbrl-doc").css("top","25px");
                    $("#app-container").css("height","90%");
                    $("#app-panel-breadcrum-container").css("height", "25px");
                }
            }
            
            // update axis
            var axisItemsText = 'All';
            var axisItems = App_Find.Filter.getAxisItemsChecked();
            if (axisItems.length == 1) {

                axisItemsText = axisItems.parent().text().trim();
            } else if (axisItems.length > 1) {

                axisItemsText = '1+';
            }
            breadcrumb.find('span[data-breadcrumb-axis]').html(axisItemsText);
            if(axisItemsText=="All"){
                //$("#axisDiv").css("display", "none");
            	App_Find.Breadcrumb.searchFor(_filterList, "Axes (");
            }else{
                //$("#axisDiv").css("display", "block");
            	App_Find.Breadcrumb.replaceNeeded(_filterList, 'Axes', 'Axes (' +axisItemsText+')');  
            	if(!App_Find.Breadcrumb.doesExist(_filterList, "Axes"))
            		_filterList.push('Axes ('+axisItemsText+')');
            }
            if((label=="All")&&(conceptLabel=="All")&&(calItemsText=="All")&&(unitItemsText=="All")&&(axisItemsText=="All")){
                $("#app-panel-breadcrum-container").css("display", "none");
                $("#app-inline-xbrl-doc").css("top","0px");
                $("#app-panel").css("top","25px");
            	$("#app-panel1").css("top","25px");
            	$("#app-panel2").css("top","25px");
                $("#app-container").css("height","95%");
            }else{
                $("#app-panel-breadcrum-container").css("display", "block");
                if($("#filterDataDiv").height()==23){
                	$("#app-panel").css("top","55px");
                	$("#app-panel1").css("top","55px");
                	$("#app-panel2").css("top","55px");
                	$("#app-inline-xbrl-doc").css("top","25px");
                    $("#app-container").css("height","90%");
                    $("#app-panel-breadcrum-container").css("height", "25px");
                }else if($("#filterDataDiv").height()==46){
                	$("#app-panel-breadcrum-container").css("height", "50px");
                	$("#app-inline-xbrl-doc").css("top","50px");
                	$("#app-panel").css("top","80px");
                	$("#app-panel1").css("top","80px");
                	$("#app-panel2").css("top","80px");
                    $("#app-container").css("height","85%");
                }else if($("#filterDataDiv").height()==69){
                	$("#app-panel-breadcrum-container").css("height", "75px");
                	$("#app-inline-xbrl-doc").css("top","75px");
                	$("#app-panel").css("top","105px");
                	$("#app-panel1").css("top","105px");
                	$("#app-panel2").css("top","105px");
                    $("#app-container").css("height","80%");
                }else if($("#filterDataDiv").height()==92){
                	$("#app-panel-breadcrum-container").css("height", "100px");
                	$("#app-inline-xbrl-doc").css("top","100px");
                	$("#app-panel").css("top","130px");
                	$("#app-panel1").css("top","130px");
                	$("#app-panel2").css("top","130px");
                    $("#app-container").css("height","75%");
                }else if($("#filterDataDiv").height()==115){
                	$("#app-panel-breadcrum-container").css("height", "125px");
                	$("#app-inline-xbrl-doc").css("top","125px");
                	$("#app-panel").css("top","155px");
                	$("#app-panel1").css("top","155px");
                	$("#app-panel2").css("top","155px");
                    $("#app-container").css("height","70%");
                }else{
                	$("#app-panel").css("top","55px");
                	$("#app-panel1").css("top","55px");
                	$("#app-panel2").css("top","55px");
                	$("#app-inline-xbrl-doc").css("top","25px");
                    $("#app-container").css("height","90%");
                    $("#app-panel-breadcrum-container").css("height", "25px");
                }
            }

            // update scale
            var scaleItemsText = 'All';
            var scaleItems = App_Find.Filter.getScaleItemsChecked();
            if (scaleItems.length == 1) {

                scaleItemsText = scaleItems.parent().text().trim();
            } else if (scaleItems.length > 1) {

                scaleItemsText = '1+';
            }
            breadcrumb.find('span[data-breadcrumb-scale]').html(scaleItemsText);
            if(scaleItemsText=="All"){
                //$("#scaleDiv").css("display", "none");
            	App_Find.Breadcrumb.searchFor(_filterList, "Scale (");
            }else{
                //$("#scaleDiv").css("display", "block");
            	App_Find.Breadcrumb.replaceNeeded(_filterList, 'Scale', 'Scale (' +scaleItemsText+')');  
            	if(!App_Find.Breadcrumb.doesExist(_filterList, "Scale"))
            		_filterList.push('Scale ('+scaleItemsText+')');
            }
            
            // update balance
            var balanceItemsText = 'All';
            var balanceItems = App_Find.Filter.getBalanceItemsChecked();
            if (balanceItems.length == 1) {

                balanceItemsText = balanceItems.parent().text().trim();
            } else if (balanceItems.length > 1) {

                balanceItemsText = '1+';
            }
            breadcrumb.find('span[data-breadcrumb-balance]').html(balanceItemsText);
            if(balanceItemsText=="All"){
                //$("#balanceDiv").css("display", "none");
            	App_Find.Breadcrumb.searchFor(_filterList, "Balance (");
            }else{
                //$("#balanceDiv").css("display", "block");
            	App_Find.Breadcrumb.replaceNeeded(_filterList, 'Balance', 'Balance (' +balanceItemsText+')');  
            	if(!App_Find.Breadcrumb.doesExist(_filterList, "Balance"))
            		_filterList.push('Balance ('+balanceItemsText+')');
            }
            if((label=="All")&&(conceptLabel=="All")&&(calItemsText=="All")&&(unitItemsText=="All")&&(axisItemsText=="All") &&(scaleItemsText=="All")&&(balanceItemsText=="All")){
                $("#app-panel-breadcrum-container").css("display", "none");
                $("#app-inline-xbrl-doc").css("top","0px");
                $("#app-panel").css("top","25px");
            	$("#app-panel1").css("top","25px");
            	$("#app-panel2").css("top","25px");
                $("#app-container").css("height","95%");
            }else{
                $("#app-panel-breadcrum-container").css("display", "block");
                if($("#filterDataDiv").height()==23){
                	$("#app-panel").css("top","55px");
                	$("#app-panel1").css("top","55px");
                	$("#app-panel2").css("top","55px");
                	$("#app-inline-xbrl-doc").css("top","25px");
                    $("#app-container").css("height","90%");
                    $("#app-panel-breadcrum-container").css("height", "25px");
                }else if($("#filterDataDiv").height()==46){
                	$("#app-panel-breadcrum-container").css("height", "50px");
                	$("#app-inline-xbrl-doc").css("top","50px");
                	$("#app-panel").css("top","80px");
                	$("#app-panel1").css("top","80px");
                	$("#app-panel2").css("top","80px");
                    $("#app-container").css("height","85%");
                }else if($("#filterDataDiv").height()==69){
                	$("#app-panel-breadcrum-container").css("height", "75px");
                	$("#app-inline-xbrl-doc").css("top","75px");
                	$("#app-panel").css("top","105px");
                	$("#app-panel1").css("top","105px");
                	$("#app-panel2").css("top","105px");
                    $("#app-container").css("height","80%");
                }else if($("#filterDataDiv").height()==92){
                	$("#app-panel-breadcrum-container").css("height", "100px");
                	$("#app-inline-xbrl-doc").css("top","100px");
                	$("#app-panel").css("top","130px");
                	$("#app-panel1").css("top","130px");
                	$("#app-panel2").css("top","130px");
                    $("#app-container").css("height","75%");
                }else if($("#filterDataDiv").height()==115){
                	$("#app-panel-breadcrum-container").css("height", "125px");
                	$("#app-inline-xbrl-doc").css("top","125px");
                	$("#app-panel").css("top","155px");
                	$("#app-panel1").css("top","155px");
                	$("#app-panel2").css("top","155px");
                    $("#app-container").css("height","70%");
                }else{
                	$("#app-panel").css("top","55px");
                	$("#app-panel1").css("top","55px");
                	$("#app-panel2").css("top","55px");
                	$("#app-inline-xbrl-doc").css("top","25px");
                    $("#app-container").css("height","90%");
                    $("#app-panel-breadcrum-container").css("height", "25px");
                }
            }
            
            
            
            var modalFilter = $('#app-container');
            var contentFilter = modalFilter.find('div[data-filter-content]');
            contentFilter.attr('data-filter-content', 'false');
            contentFilter.html('');
            if(_filterList.length>1){     
            
	            var clearfilterNode = '<span style="display: block;float: left;clear: right;vertical-align: middle;"><span>Clear All &nbsp;</span>' ;
	            clearfilterNode += '<span class="glyphicon glyphicon-remove-circle" style="line-height: 25px;vertical-align: bottom; margin-bottom: -2px;" title="Clear All Filters" tabindex="8">' +
			            '</span></span></span>';
	            var clearAllObj = $(clearfilterNode);
	           	clearAllObj.bind('keypress', function(e) {
					var code = e.keyCode || e.which;
					if((code == 13) || (code == 32)) { //Enter keycode
						App.showSpinner1($('#mainDiv'), function() {
							App_Find.Highlight.resetData();
							App_Find.Highlight.resetConcepts();
							App_Find.Filter.resetPeriod();
							App_Find.Filter.resetUnits();
							App_Find.Filter.resetAxis();
							App_Find.Filter.resetScale();
			                App_Find.Filter.resetBalance();
			                App_Find.Highlight.refresh();
		                    App.hideSpinner();
		                });
		            }
				});
	            clearAllObj.on('click', function() {
	           		App.showSpinner1($('#mainDiv'), function() {
						App_Find.Highlight.resetData();
						App_Find.Highlight.resetConcepts();
						App_Find.Filter.resetPeriod();
						App_Find.Filter.resetUnits();
						App_Find.Filter.resetAxis();
						App_Find.Filter.resetScale();
		                App_Find.Filter.resetBalance();
		                App_Find.Highlight.refresh();
	                    App.hideSpinner();
	                });
	 	        });
		  	    contentFilter.append(clearAllObj);   
	  	    }
	  	    
            for(var _index=0; _index < _filterList.length; _index++){
            	var filterNode = '<span id="filterDiv" style="display: block;float: left;clear: right;vertical-align: middle;margin-right: -10px;">>&nbsp;&nbsp;' +
	                    '<span>' + _filterList[_index] + '&nbsp;</span>';
	            
	            var filterNodeObj;
	            var button ='';
	            if(_dataList.indexOf(_filterList[_index])!=-1){
	            	filterNode +='<span class="glyphicon glyphicon-remove-circle" style="line-height: 25px;vertical-align: bottom; margin-bottom: -2px;" title="Clear Data Filter" data-btn-removeHighlight>' +
		            '</span>&nbsp;&nbsp;</span>';
	            	filterNodeObj = $(filterNode);
	            	filterNodeObj.on('click', function() {
	            		App.showSpinner1($('#mainDiv'), function() {
							App_Find.Highlight.resetData();
	  	                 	App_Find.Highlight.refresh();
		                    App.hideSpinner();
		                });
	  	            });
	            }else if(_tagList.indexOf(_filterList[_index])!=-1){
	            	filterNode +='<span class="glyphicon glyphicon-remove-circle" style="line-height: 25px;vertical-align: bottom; margin-bottom: -2px;" title="Clear Tags Filter" data-btn-removeConcepts>' +
		            '</span>&nbsp;&nbsp;</span>';
	            	filterNodeObj = $(filterNode);
	            	filterNodeObj.on('click', function() {
	            		App.showSpinner1($('#mainDiv'), function() {
							App_Find.Highlight.resetConcepts();
	  	                 	App_Find.Highlight.refresh();
		                    App.hideSpinner();
		                });
	  	            	 
	  	            });
	            }else if(_filterList[_index].match("Periods")=="Periods"){
	            	filterNode +='<span class="glyphicon glyphicon-remove-circle" style="line-height: 25px;vertical-align: bottom; margin-bottom: -2px;" title="Clear Periods Filter" data-btn-removePeriods>' +
		            '</span>&nbsp;&nbsp;</span>';
	            	filterNodeObj = $(filterNode);
	            	filterNodeObj.on('click', function() {
	            		App.showSpinner1($('#mainDiv'), function() {
							App_Find.Filter.resetPeriod();
	  	                 	App_Find.Highlight.refresh();
		                    App.hideSpinner();
		                });
	  	            	 
	  	            });
	            }else if(_filterList[_index].match("Measures")=="Measures"){
	            	filterNode += '<span class="glyphicon glyphicon-remove-circle" style="line-height: 25px;vertical-align: bottom; margin-bottom: -2px;" title="Clear Measures Filter" data-btn-removeUnits>' +
		            '</span>&nbsp;&nbsp;</span>';
	            	filterNodeObj = $(filterNode);
	            	filterNodeObj.on('click', function() {
	            		App.showSpinner1($('#mainDiv'), function() {
							App_Find.Filter.resetUnits();
	  	                 	App_Find.Highlight.refresh();
		                    App.hideSpinner();
		                });
	  	            });
	            }else if(_filterList[_index].match("Axes")=="Axes"){
	            	filterNode +='<span class="glyphicon glyphicon-remove-circle" style="line-height: 25px;vertical-align: bottom; margin-bottom: -2px;" title="Clear Axes Filter" data-btn-removeAxis>' +
		            '</span>&nbsp;&nbsp;</span>';
	            	filterNodeObj = $(filterNode);
	            	filterNodeObj.on('click', function() {
	            		App.showSpinner1($('#mainDiv'), function() {
							App_Find.Filter.resetAxis();
	  	                 	App_Find.Highlight.refresh();
		                    App.hideSpinner();
		                });
	  	            });
	            }else if (_filterList[_index].match("Scale")=="Scale"){
	            	filterNode +='<span class="glyphicon glyphicon-remove-circle" style="line-height: 25px;vertical-align: bottom; margin-bottom: -2px;" title="Clear Scale Filter" data-btn-removeScale>' +
		            '</span>&nbsp;&nbsp;</span>';
	            	filterNodeObj = $(filterNode);
	            	filterNodeObj.on('click', function() {
	            		App.showSpinner1($('#mainDiv'), function() {
							App_Find.Filter.resetScale();
	  	                 	App_Find.Highlight.refresh();
		                    App.hideSpinner();
		                });
	  	            	 
	  	            });
	            }else if (_filterList[_index].match("Balance")=="Balance"){
	            	filterNode +='<span class="glyphicon glyphicon-remove-circle" style="line-height: 25px;vertical-align: bottom; margin-bottom: -2px;" title="Clear Balance Filter" data-btn-removeBalance>' +
		            '</span>&nbsp;&nbsp;</span>';
	            	filterNodeObj = $(filterNode);
	            	filterNodeObj.on('click', function() {
	            		App.showSpinner1($('#mainDiv'), function() {
							App_Find.Filter.resetBalance();
	  	                 	App_Find.Highlight.refresh();
		                    App.hideSpinner();
		                });
	  	            });
	            }	
	            contentFilter.append(filterNodeObj);
	            
            }
            if($("#filterDataDiv").height()==0){
            	$("#app-panel-breadcrum-container").css("display", "none");
                $("#app-inline-xbrl-doc").css("top","0px");
                $("#app-panel").css("top","25px");
            	$("#app-panel1").css("top","25px");
            	$("#app-panel2").css("top","25px");
                $("#app-container").css("height","95%");
            }else if($("#filterDataDiv").height()==23){
            	$("#app-panel").css("top","55px");
            	$("#app-panel1").css("top","55px");
            	$("#app-panel2").css("top","55px");
            	$("#app-inline-xbrl-doc").css("top","25px");
                $("#app-container").css("height","90%");
                $("#app-panel-breadcrum-container").css("height", "25px");
            }else if($("#filterDataDiv").height()==46){
            	$("#app-panel-breadcrum-container").css("height", "50px");
            	$("#app-inline-xbrl-doc").css("top","50px");
            	$("#app-panel").css("top","80px");
            	$("#app-panel1").css("top","80px");
            	$("#app-panel2").css("top","80px");
                $("#app-container").css("height","85%");
            }else if($("#filterDataDiv").height()==69){
            	$("#app-panel-breadcrum-container").css("height", "75px");
            	$("#app-inline-xbrl-doc").css("top","75px");
            	$("#app-panel").css("top","105px");
            	$("#app-panel1").css("top","105px");
            	$("#app-panel2").css("top","105px");
                $("#app-container").css("height","80%");
            }else if($("#filterDataDiv").height()==92){
            	$("#app-panel-breadcrum-container").css("height", "100px");
            	$("#app-inline-xbrl-doc").css("top","100px");
            	$("#app-panel").css("top","130px");
            	$("#app-panel1").css("top","130px");
            	$("#app-panel2").css("top","130px");
                $("#app-container").css("height","75%");
            }else if($("#filterDataDiv").height()==115){
            	$("#app-panel-breadcrum-container").css("height", "125px");
            	$("#app-inline-xbrl-doc").css("top","125px");
            	$("#app-panel").css("top","155px");
            	$("#app-panel1").css("top","155px");
            	$("#app-panel2").css("top","155px");
                $("#app-container").css("height","70%");
            }else{
            	$("#app-panel").css("top","55px");
            	$("#app-panel1").css("top","55px");
            	$("#app-panel2").css("top","55px");
            	$("#app-inline-xbrl-doc").css("top","25px");
                $("#app-container").css("height","90%");
                $("#app-panel-breadcrum-container").css("height", "25px");
            }
            
        }
        
    },
    Settings:{
        init:function() {
			
			var modal = $('#settings-modal'); 
            modal.find('input[type="radio"]').on('change', function() {

                App_Find.Filter.getUnitItemsChecked().each(function() {

                    $(this).prop('checked', false);
                });

                App_Find.Filter.getCalendarItemsChecked(true).each(function() {

                    $(this).prop('checked', false);
                });
                App_Find.Filter.getAxisItemsChecked(true).each(function() {

                    $(this).prop('checked', false);
                });
                App_Find.Filter.getScaleItemsChecked(true).each(function() {

                    $(this).prop('checked', false);
                });
                App_Find.Filter.getBalanceItemsChecked(true).each(function() {
					
                    $(this).prop('checked', false);
                });
                App_Find.Filter.updateSelectedCounts();
                App_Find.Breadcrumb.refresh();
                App_Find.Results.load();
            }); 
            
            $('#settings-modal').on('shown.bs.modal', function () {
			   $('#settings-modal').focus();
			});
            
            var isClicked = false;
            if(!isClicked){
	            var modal = $('#settings-modal'); 
	            modal.find('#search-include-dimensions').on('click', function() {
		            App.showSpinner($('.modal-header'), function() {

		            	isClicked = true;
			            var items = App.InlineDoc.getAxis();
			
			            var contextValues = [];
			            items.each(function(index, element) {
			            	var ele = $(element);
			                var pele = $(ele.parents()[2]);
			                var contextId = pele.attr('id');
			            	if($.inArray(contextId,contextValues) == -1){
			                    contextValues.push(contextId);
			                    var axisLabel = ele.attr('dimension');
				                var axislval = App.InlineDoc.getSelectedLabel(App_Utils.convertToXBRLId(axisLabel),this,null,function(value){
				
				                    axisLabel = value + ' - ' + axisLabel;
				                    return false;
				
				                });
				
				                // member label
			                    var memberLabel = ele.html();
			                    var memberlval = App.InlineDoc.getSelectedLabel(App_Utils.convertToXBRLId(memberLabel),this,null,function(value){
			
			                            memberLabel = value + ' - ' + memberLabel;
			                            return false;
			
			                    });
			                    var dimensionLabel = axisLabel+" &nbsp;&nbsp;"+memberLabel;
			                    App.InlineDoc.updateContextAxisForSearch(contextId, dimensionLabel);
			                }
		            	});  
		            	
	                    App.hideSpinner();
	                });
            	});
            }
        }
    },
    TaggedSection:{
    	results:$(),
        totalPages:0,
        currentPage:1,
        resultsPerPage:15,
        _cachescrollDestination:$(),
        isInitialized:false,
        prevItem:null,
        resetUI:function() {

            App_Find.TaggedSection.results = $();
        },
        goToPage:function(pageNumber, selector) {

            $('#results-reports').html('');
            App_Find.TaggedSection.currentPage = pageNumber;
            App_Find.TaggedSection.show();
            if (selector) {

                App_Find.TaggedSection.selectItem($('#results-reports').children(selector).attr('data-result-index'));
            }
        },
        prevPage:function(selector) {

            var page = App_Find.TaggedSection.currentPage - 1;
            if (page > 0) {

                App_Find.TaggedSection.goToPage(page, selector);
            }
        },
        nextPage:function(selector) {

            var page = App_Find.TaggedSection.currentPage + 1;
            if (page <= App_Find.TaggedSection.totalPages) {

                App_Find.TaggedSection.goToPage(page, selector);
            }
        },
        prevItem:function() {

            var results = $('#results-reports');
            var selectedItem = results.find('[data-is-selected="true"]');
            if(selectedItem.length == 1 && selectedItem.prev().length == 1) {

                App_Find.TaggedSection.selectItem(selectedItem.prev().attr('data-result-index'));
            } else {

                App_Find.TaggedSection.prevPage(':last-child');
            }
        },
        nextItem:function() {

            var results = $('#results-reports');
            var selectedItem = results.find('[data-is-selected="true"]');
            if(selectedItem.length == 1) {

                if (selectedItem.next().length == 1) {

                    App_Find.TaggedSection.selectItem(selectedItem.next().attr('data-result-index'));
                } else {

                    App_Find.TaggedSection.nextPage(':first');
                }
            } else {

                App_Find.TaggedSection.selectItem(results.children(':first').attr('data-result-index'));
            }
        },
        selectItem:function(index, showElementDetail) {
        	
        	var report = App_Find.TaggedSection.results[index];
            var docContent = App.InlineDoc.getDocumentContent();            
            var firstAnchor = report.firstAnchor;
            var hasFirstAnchor = firstAnchor && firstAnchor.name && firstAnchor.contextRef && true;            
            var uniqueAnchor = report.uniqueAnchor ;
            var hasUniqueAnchor = uniqueAnchor && uniqueAnchor.name && uniqueAnchor.contextRef && true;            
            function retrieve(node,fact) {
            	var query = '[name="'+fact.name+'"]';
	            var found = node.find(query);
	            return found; 
            }
            var found = null;
            var best = null;
            if (firstAnchor && uniqueAnchor && firstAnchor.unique && uniqueAnchor.first) { // have just one
            	best = found = retrieve((docContent),firstAnchor);
            } else if (firstAnchor && !uniqueAnchor) { // have only a first anchor that is not unique
            	// you may take the user to the wrong place in the document, warn them.
            	found = retrieve((docContent),firstAnchor);
            } else { // we have two.  use the unique to locate the part of the document, then scan for first.
            	found = retrieve((docContent),uniqueAnchor);
            	if (!(found && found[0])) {
            		found = retrieve(ancestor,firstAnchor);
            	} else {
            		var ancestors = found.parents();            	
            		for (var i=0;i< ancestors.length;i++) {
            			var ancestor = ancestors[i];
            			if (found[0] == ancestor) continue;
	            		var node = retrieve($(ancestor),firstAnchor);
	            		if (node && node[0]) {
	            			best = node;
	            			break;
	            		}
            		}
            	}
            }
            if (!found) {
            	App.showMessage('Could not locate \n' + report.shortName + '.');
            	return;
            } else if ((found && !best)||(best)) {
            	if (best) {
            		App.hideMessage();
            		found = best;
            	} else {
            		App.showMessage('Data tagged for ' + report.shortName + ' not in expected location.',{'hideAfter':'3000'});
            	}
            	
            	// found.selectionHighlight();
            	var ancestors = found.parents();
            	var scrollDestination = found[0];
            	
            	for (var i=0;i < ancestors.length;i++) {
            		var ancestor = ancestors[i];
            		var display = $(ancestor).css('display');
            		if (display=='table') {
            			scrollDestination = ancestor;
            			break;
            		}
            	}
            	if (screen.width < 641) {
					$('#app-panel-reports-container').hide('slide');
	            	$('#app-panel2').removeClass('visible').animate({'margin-left':'-100%'});
	            	$('#app-inline-xbrl-doc').css({'width':'100%'});
	            	App_Find.TaggedSection._cachescrollDestination=null;
				}
				
            	App_Find.TaggedSection._cachescrollDestination = scrollDestination;
            	scrollDestination.scrollIntoView();
            	if (showElementDetail){
            		App_Find.TaggedSection.highlightItemOperatingCo(index,showElementDetail); 
            	}else{
            		App_Find.TaggedSection.highlightItem(index); 
            	}
            	/*if (showElementDetail){//  || $('#selection-detail-container').css('display') == 'block') { 
            		App_Find.Element.showSelectionDetail(found);
            	}   */ 
            	
            	       	
            } else {
            	 App.showMessage('Internal error locating '+report.shortName+'.');
            }
        },
        highlightItem:function(index) {

            var results = $('#results-reports');
            results.find('[data-is-selected="true"]').each(function(index, element) {

                var node = $(element);
                node.attr('data-is-selected', 'false');
                var resultItemDiv = node.find('[class="rightNavLinks"]');
                resultItemDiv.css('border', '2px solid #7B7B7B');
                
            });
            var resultItem = results.find('[data-result-index="' + index + '"]');
            if (resultItem.length == 1) {

                resultItem.attr('data-is-selected', 'true');
                var resultItemDiv = resultItem.find('[class="rightNavLinks"]');
                resultItemDiv.css('border', '4px solid '+App_Settings.get('focusHighlightColor'));
            }
        },
        highlightItemOperatingCo:function(index,showElementDetail) {
			var report = App_Find.TaggedSection.results[index];
            var results = $('#usGaapTaggedSection');
            results.find('[data-is-selected="true"]').each(function(index, element) {

                var node = $(element);
                node.attr('data-is-selected', 'false');
                if(prevItem){
                	prevItem.css('border', '0px solid '+App_Settings.get('focusHighlightColor'));
                }
                
            });
            var resultItem = results.find('[data-result-index="' + index + '"]');
            if (resultItem.length == 1) {
				prevItem = showElementDetail;
                resultItem.attr('data-is-selected', 'true');
                //var resultItemDiv = resultItem.find('[class="result-item"]');
                //console.log(resultItemDiv);
                showElementDetail.css('border', '4px solid '+App_Settings.get('focusHighlightColor'));
            }
        },
    	init:function(){  
            
            $('[data-toggle=collapse]').click(function(){
			  	// toggle icon
			  	$(this).find("i").toggleClass("glyphicon-chevron-right glyphicon-chevron-down");
			});
            
            $('[data-toggle=collapse]').bind('keypress', function(e) {
				var code = e.keyCode || e.which;
				if((code == 13) || (code == 32)) { //Enter keycode
					// toggle icon
				  	e.preventDefault();
				  	$(this).click();
				}
			});
            
			
			
            var section = $('#results-header-report-mutualFund');
			
            // wire up the next/prev item buttons
            section.find('a').each(function(index, element) {

                if (index == 0) {

                    // prev item
                    $(element).on('click', function() {

                        App_Find.TaggedSection.prevItem();
                    });
                } else {

                    // next item
                    $(element).on('click', function() {

                        App_Find.TaggedSection.nextItem();
                    });
                }
            });
            
            

            // wire up the paging buttons
            section.find('.btn-container button').each(function(index, element) {

                switch (index) {

                    case 0:
                        // Page To Beginning
                        $(element).on('click', function() {

                            App_Find.TaggedSection.goToPage(1, ':first');
                        });
                        break;
                    case 1:
                        // Prev Page
                        $(element).on('click', function() {

                            App_Find.TaggedSection.prevPage(':first');
                        });
                        break;
                    case 2:
                        // Next Page
                        $(element).on('click', function() {

                            App_Find.TaggedSection.nextPage(':first');
                        });
                        break;
                    case 3:
                        // Page To End
                        $(element).on('click', function() {

                            App_Find.TaggedSection.goToPage(App_Find.TaggedSection.totalPages, ':first');
                        });
                        break;
                }
            });
            
            
            var section = $('#results-header-report-operating');
			
            // wire up the paging buttons
            section.find('.btn-container button').each(function(index, element) {

                switch (index) {

                    case 0:
                        // Page To Beginning
                        $(element).on('click', function() {

                            App_Find.TaggedSection.goToPage(1, ':first');
                        });
                        break;
                    case 1:
                        // Prev Page
                        $(element).on('click', function() {

                            App_Find.TaggedSection.prevPage(':first');
                        });
                        break;
                    case 2:
                        // Next Page
                        $(element).on('click', function() {

                            App_Find.TaggedSection.nextPage(':first');
                        });
                        break;
                    case 3:
                        // Page To End
                        $(element).on('click', function() {

                            App_Find.TaggedSection.goToPage(App_Find.TaggedSection.totalPages, ':first');
                        });
                        break;
                 }
            });
            

	        $('#app-panel-reports-container').find('[data-btn-remove]').on('click', function() {
				if (screen.width < 641) {
					$('#app-panel-reports-container').hide('slide');
	            	$('#app-panel2').removeClass('visible').animate({'margin-left':'-100%'});
	            	$('#app-inline-xbrl-doc').css({'width':'100%'});
				}else{
	            	$('#app-panel-reports-container').hide('slide');
	            	$('#app-panel2').removeClass('visible').animate({'margin-left':'-30%'});
	            	$('#app-inline-xbrl-doc').css({'width':'100%'});
	            }
	            if((App_Find.TaggedSection._cachescrollDestination!=null)){
	            	App_Find.TaggedSection._cachescrollDestination.scrollIntoView();
	            	App_Find.TaggedSection._cachescrollDestination=null;
	            }
	        });
        
            $('#btn-reports').on('click', function() {
            
            	$('#app-panel-reports-container').show('slide');
				App_Find.TaggedSection.loadData();
	            	
			});
			
			$('#menuBtn-reports').on('click', function() {
			
            	$('#app-panel-reports-container').show('slide');
				App_Find.TaggedSection.loadData();
	            	
			});
			
			$('#menuBtn-reports').bind('keypress', function(e) {
				var code = e.keyCode || e.which;
				if((code == 13) || (code == 32)) { //Enter keycode
				  	$('#app-panel-reports-container').show('slide');
					App_Find.TaggedSection.loadData();			
				}
			});
			
         },
         
         getReportData:function(){
         	
           	var reports = App.InlineDoc.getMetaData().report;
           	var results = [];
	        for (index in reports) {
	        var report = reports[index];
	        	if (report.groupType.length > 0 && report.firstAnchor) {      
                    results.push(report);

                }
	        }
	        return results;
         },
         
         loadData:function(){
         	
           	var results = App_Find.TaggedSection.getReportData();
           	results.sort(function(a,b) {return (a.longName).localeCompare(b.longName);})
		        
	        var remoteElements = App.InlineDoc.getRemoteFileDetails();
	        var containsUsGaap = false;
           	for (key in remoteElements) {
		        if (remoteElements[key].indexOf("us-gaap")>0) {
		        	containsUsGaap = true;
		            break;
		        }
		    }
		    if(containsUsGaap){
		    	App_Find.TaggedSection.showNew(results,false);
		    }else{
	        	App_Find.TaggedSection.show(results);
	        }
	        //App_Find.TaggedSection.show(results);
         },
         
         load:function(){
           	var results = App_Find.TaggedSection.getReportData();
	        $('#results-count-reports-badge').html('' + results.length + '');
	        
	        App_Find.TaggedSection.isInitialized = true;
         },
         
         refreshTaggedSection:function(searchInputVal){
         	var reports = App.InlineDoc.getMetaData().report;
           	var results = [];
	        for (index in reports) {
	        	var report = reports[index];
	        	if(searchInputVal!=null && searchInputVal.length >0){
	        		if (report.groupType.length > 0 && report.firstAnchor && (report.shortName.toLowerCase().indexOf(searchInputVal.toLowerCase())>-1)) {
	                    results.push(report);
	                }
	        	}else{
	        		if (report.groupType.length > 0 && report.firstAnchor) {
	                    results.push(report);
	                }
	        	}
	        }
	        results.sort(function(a,b) {return (a.longName).localeCompare(b.longName);})
	        
	        var remoteElements = App.InlineDoc.getRemoteFileDetails();
	        var containsUsGaap = false;
           	for (key in remoteElements) {
		        if (remoteElements[key].indexOf("us-gaap")>0) {
		        	containsUsGaap = true;
		            break;
		        }
		    }
		    if(containsUsGaap){
		    	if(searchInputVal!=null && searchInputVal.length >0){
	        		App_Find.TaggedSection.showNew(results,true);
	        	}else{
	        		App_Find.TaggedSection.showNew(results,false);
	        	}
		    }else{
	        	App_Find.TaggedSection.show(results);
	        }
	        
	        //App_Find.TaggedSection.show(results);
         },
         
         show:function(results){
         	$("#operatingCompanyTaggedSection").css({'display':'none'});
         	$("#results-header-report-operating").css({'display':'none'});
         	var searchReportsResult = $('#results-reports');
			if (results) {
			    searchReportsResult.html('');
			
			    App_Find.TaggedSection.totalPages = Math.ceil(results.length/App_Find.TaggedSection.resultsPerPage);
			    App_Find.TaggedSection.results = null;
			    App_Find.TaggedSection.results = $(results); // load
			
			    if (results.length == 0) {
			
			        App_Find.TaggedSection.currentPage = 0;
			    }
			}
		
            if (App_Find.TaggedSection.totalPages == 0) {

                App_Find.TaggedSection.currentPage = 0;
            }
		
            $('#results-pages-reports').html(App_Find.TaggedSection.currentPage + ' of ' + App_Find.TaggedSection.totalPages);
            $('#results-count-reports').html('' + App_Find.TaggedSection.results.length + '');
            
            
            for (var index in App_Find.TaggedSection.results) {
            	
                if (index < (App_Find.TaggedSection.currentPage * App_Find.TaggedSection.resultsPerPage) &&
                   index >= ((App_Find.TaggedSection.currentPage * App_Find.TaggedSection.resultsPerPage) - App_Find.TaggedSection.resultsPerPage)) {
                   var label = App_Find.TaggedSection.results[index].shortName;
                   
                   
                   var resultHtml = '<div class="result-item" data-is-selected="false" data-result-index="' + index + '" >' +
                                                   '<div tabindex="3" class="rightNavLinks" style="float:none">'+$('<div/>').html(label).text()+'</div></div>';
                   var resultHtmlObj = $(resultHtml);
                   resultHtmlObj.on('click', function() {
                	   App_Find.TaggedSection.selectItem($(this).attr('data-result-index'));
                   });
                   searchReportsResult.append(resultHtmlObj);
                }
			}
         },
         
         showNew:function(results,isFinanceExpand){
         	
         	$("#vcrControls").css({'display':'none'});
         	$("#mutualFundTaggedSection").css({'display':'none'});
         	$("#results-header-report-mutualFund").css({'display':'none'});
         	$("#prevButton").css({'display':'none'});
         	$("#nextButton").css({'display':'none'});

         	var documentType = $('#documentType');
         	var statementType = $('#statementType');
         	var disclosureType = $('#disclosureType');
         	var disclosureTypeExpanded = $('#disclosureTypeExpanded');
         	
			if (results) {
			    documentType.html('');
			    statementType.html('');
			    disclosureType.html('');
			    disclosureTypeExpanded.html('');
			    $("#documentTypeSingleLIDiv").html('');
			    
				$("#documentTypeMainLIDiv").css({'display':'block'})
				$("#documentTypeSingleLIDiv").css({'display':'block'})
		        $("#statementLi").css({'display':'block'})
		        $("#disclosureLi").css({'display':'block'})
		        $("#disclosureLiDup").css({'display':'block'})
			
			    App_Find.TaggedSection.results = null;
			    App_Find.TaggedSection.results = $(results); // load
			
			}
            $('#results-count-reports').html('' + App_Find.TaggedSection.results.length + '');
            
            var countDocumentType = 0;
            var countStatementType = 0;
            var countDisclosureType = 0;
            
            var resultHtmlObjs = [];
            
            for (var index in App_Find.TaggedSection.results) {
            	
            	var groupType =  App_Find.TaggedSection.results[index].groupType;
            	
            	if(groupType!=null && groupType.length>0){
            		
            		var label = App_Find.TaggedSection.results[index].shortName;
                   	var resultHtml = '<li class="result-item" data-is-selected="false" tabindex="3" data-result-index="' + index + '" style="list-style-type: none;text-decoration: underline;cursor:pointer;" >' + $('<div/>').html(label).text()+'</li>';
                   	var resultHtmlObj = $(resultHtml);
                   	resultHtmlObj.on('click', function() {
                	   	App_Find.TaggedSection.selectItem($(this).attr('data-result-index'),$(this));
                   	});
                   	
                   	resultHtmlObj.on('keyup', function(e) {                  
                	   var code = e.keyCode || e.which;                	   
                  		if((code == 13) || (code == 32)) {                   		
                	   		App_Find.TaggedSection.selectItem($(this).attr('data-result-index'),$(this));
                	   }
                  	});   
                   	
            		if(groupType == "document"){
            			countDocumentType++;
            			resultHtmlObjs.push(resultHtmlObj);
            			
            		}else if(groupType == "statement"){
            			
            			statementType.append(resultHtmlObj);
            			countStatementType++;
            			
            		}else if(groupType == "disclosure"){
            			if(isFinanceExpand){
            				disclosureTypeExpanded.append(resultHtmlObj);
            				countDisclosureType++;
            				$("#disclosureLi").css({'display':'none'});
            			}else{
            				disclosureType.append(resultHtmlObj);
            				countDisclosureType++;
            				$("#disclosureLiDup").css({'display':'none'});
            			}
            			
            		}
            	}
			}
			if(countDocumentType>1){
		        
		        for(var i=0;i<resultHtmlObjs.length;i++)  {
		        	documentType.append(resultHtmlObjs[i])
		        }
		        $("#documentTypeSingleLIDiv").css({'display':'none'})
			}else if((countDocumentType==1)&&(resultHtmlObjs[0].html()=="Document and Entity Information")){
				$("#documentTypeSingleLIDiv").append(resultHtmlObjs[0]);
				//$("#documentTypeSingleLIDiv").css({'font-weight':'bold'});
				$("#documentTypeMainLIDiv").css({'display':'none'});
			}else if((countDocumentType==1)&&(resultHtmlObjs[0].html()!="Document and Entity Information")){
				documentType.append(resultHtmlObjs[0])
				$("#documentTypeSingleLIDiv").css({'display':'none'});
			}else if(countDocumentType<1){
				$("#documentTypeMainLIDiv").css({'display':'none'});
				$("#documentTypeSingleLIDiv").css({'display':'none'});
			}
			
			if(countStatementType==0){
		        $("#statementLi").css({'display':'none'});
			}
			
			if(countDisclosureType==0){
		        $("#disclosureLi").css({'display':'none'});
		        $("#disclosureLiDup").css({'display':'none'});
			}
         }
    },
    Search:{
        init:function() {

            $('#search-btn').on('click', function() {
				App.showSpinner1($('#mainDiv'), function() {
					App_Find.Results.load();
					if($('#app-panel-reports-container').css('display') == 'block'){
						App_Find.TaggedSection.refreshTaggedSection($('#search-input').val());
					}
                    App.hideSpinner();
                });
                
            });
           

            $('#search-input').on('blur', function() {

                if ($(this).val() == '') {


                }
            }).on('keypress', function(e) {
				
                if(e.which == 13) {
					
                    e.preventDefault();
                    
                    App.showSpinner1($('#mainDiv'), function() {
						App_Find.Results.load();
						if($('#app-panel-reports-container').css('display') == 'block'){
							App_Find.TaggedSection.refreshTaggedSection($('#search-input').val());
						}
	                    App.hideSpinner();
	                });
                }
            });
        },
        resetUI:function() {

            $('#search-input').val('');
            $('#search-options').find('input[type="checkbox"]').each(function(index, element) {

                $(element).prop('checked', false);
            });
        },
        getSelected:function() {

            return {
                searchStr:$('#search-input').val(),
                xbrlOnly:$('#search-xbrl-only').is(':checked'),
                matchCase:$('#search-match-case').is(':checked'),
                includeDefs:$('#search-include-definitions').is(':checked'),
                includeLabels:$('#search-include-labels').is(':checked'),
                includeDimensions:$('#search-include-dimensions').is(':checked'),
                includeReferences:$('#search-include-references').is(':checked')
            };
        }
    },
    Results:{
        results:$(),
        totalPages:0,
        currentPage:1,
        resultsPerPage:10,
        units:[],
        scale:[],
        calendars:[],
        _cachescrollDestination:$(),
        init:function() {

            var section = $('#panel-section-results');

            // wire up the next/prev item buttons
            section.find('span').each(function(index, element) {
                if (index == 1) {

                    // prev item
                    $(element).on('click', function() {

                        App_Find.Results.prevItem();
                        
                    });
                    
                    $(element).on('keypress', function(e) {
                    	var code = e.keyCode || e.which;
    					if((code == 13) || (code == 32)) { //Enter keycode
    						App_Find.Results.prevItem();
    					}
                    });
                } else if (index == 2) {

                    // next item
                    $(element).on('click', function() {

                        App_Find.Results.nextItem();
                    });
                    
                    $(element).on('keypress', function(e) {
                    	var code = e.keyCode || e.which;
    					if((code == 13) || (code == 32)) { //Enter keycode
    						App_Find.Results.nextItem();
    					}
                    });
                }
            });
            
            

            // wire up the paging buttons
            section.find('.btn-container button').each(function(index, element) {

                switch (index) {

                    case 0:
                        // Page To Beginning
                        $(element).on('click', function() {

                            App_Find.Results.goToPage(1, ':first');
                        });
                        break;
                    case 1:
                        // Prev Page
                        $(element).on('click', function() {

                            App_Find.Results.prevPage(':first');
                        });
                        break;
                    case 2:
                        // Next Page
                        $(element).on('click', function() {

                            App_Find.Results.nextPage(':first');
                        });
                        break;
                    case 3:
                        // Page To End
                        $(element).on('click', function() {

                            App_Find.Results.goToPage(App_Find.Results.totalPages, ':first');
                        });
                        break;
                }
            });
        },
        resetUI:function() {

            App_Find.Results.results = $();
            App_Find.Results.units = [];
            App_Find.Results.axis = [];
            App_Find.Results.scale = [];
            App_Find.Results.balance = [];
            App_Find.Results.calendars = [];
            App_Find.Results.load();
        },
        goToPage:function(pageNumber, selector) {

            $('#results').html('');
            App_Find.Results.currentPage = pageNumber;
            App_Find.Results.show();
            if (selector) {

                App_Find.Results.selectItem($('#results').children(selector).attr('data-result-index'));
            }
        },
        prevPage:function(selector) {

            var page = App_Find.Results.currentPage - 1;
            if (page > 0) {

                App_Find.Results.goToPage(page, selector);
            }
        },
        nextPage:function(selector) {

            var page = App_Find.Results.currentPage + 1;
            if (page <= App_Find.Results.totalPages) {

                App_Find.Results.goToPage(page, selector);
            }
        },
        prevItem:function() {

            var results = $('#results');
            var selectedItem = results.find('[data-is-selected="true"]');
            if(selectedItem.length == 1 && selectedItem.prev().length == 1) {

                App_Find.Results.selectItem(selectedItem.prev().attr('data-result-index'));
            } else {

                App_Find.Results.prevPage(':last-child');
            }
        },
        nextItem:function() {

            var results = $('#results');
            var selectedItem = results.find('[data-is-selected="true"]');
            if(selectedItem.length == 1) {

                if (selectedItem.next().length == 1) {

                    App_Find.Results.selectItem(selectedItem.next().attr('data-result-index'));
                } else {

                    App_Find.Results.nextPage(':first');
                }
            } else {

                App_Find.Results.selectItem(results.children(':first').attr('data-result-index'));
            }
        },
        selectItem:function(index, showElementDetail) {

            var ele = App_Find.Results.results[index];
            if (ele && !ele.jquery) {

                ele = $(ele);
            }

            App_Find.Results.highlightItem(index);
            if(ele){
            	ele.selectionHighlight();
            	if((window.orientation) || (window.orientation=='0')){
	                    if ((screen.width > 640) && (screen.width < 769) && ($("#filterDataDiv").height()==0)) {
	                	   ele.css({"padding-top": "30px"});
					    } 
	                   else if ((screen.width > 640) && (screen.width < 769) && ($("#filterDataDiv").height()==23)) {
	                	   ele.css({"padding-top": "53px"});
					    } 
	                   else if ((screen.width > 640) && (screen.width < 769) && ($("#filterDataDiv").height()==46)) {
	                	   ele.css({"padding-top": "76px"});
					    } 
	                   else if ((screen.width > 640) && (screen.width < 769) && ($("#filterDataDiv").height()==69)) {
	                	   ele.css({"padding-top": "99px"});
					    } 
	                   else if ((screen.width > 640) && (screen.width < 769) && ($("#filterDataDiv").height()==92)) {
	                	   ele.css({"padding-top": "122px"});
					    } 
	                   else if ((screen.width > 640) && (screen.width < 769) && ($("#filterDataDiv").height()==115)) {
	                	   ele.css({"padding-top": "145px"});
					    } 
					   
				   }
            	App_Find.Results._cachescrollDestination = ele[0];
            	ele[0].scrollIntoView();
			}
            if (showElementDetail || $('#selection-detail-container').parent().css('display') == 'block') {

                App_Find.Element.showSelectionDetail(ele);
            }
        },
        highlightItem:function(index) {

            var results = $('#results');
            results.find('[data-is-selected="true"]').each(function(index, element) {

                var node = $(element);
                node.attr('data-is-selected', 'false');
                var resultItemDiv = node.find('[class="rightNavLinks"]');
                resultItemDiv.css('border', '2px solid #7B7B7B');
                
            });
            var resultItem = results.find('[data-result-index="' + index + '"]');
            if (resultItem.length == 1) {

                resultItem.attr('data-is-selected', 'true');
                var resultItemDiv = resultItem.find('[class="rightNavLinks"]');
                resultItemDiv.css('border', '4px solid '+App_Settings.get('focusHighlightColor'));
            }
        },
        resetHighlightColor:function(index) {

            var results = $('#results');
            results.find('[data-is-selected="true"]').each(function(index, element) {

                var node = $(element);
                node.attr('data-is-selected', 'false');
                var resultItemDiv = node.find('[class="rightNavLinks"]');
                resultItemDiv.css('border', '2px solid #7B7B7B');
                
            });
        },
        refreshHighlightColor:function() {

            $('#results').find('[data-is-selected="true"]').each(function(index, element) {
               var resultItemDiv = $(element).find('[class="rightNavLinks"]');
               resultItemDiv.css('border', '4px solid '+App_Settings.get('focusHighlightColor'));
            });
        },
        load:function() {
        	
            App_Find.removeHighlightFilter();

            var filter = App_Find.Filter.getSelected();
            var search = App_Find.Search.getSelected();
            
            var results = App_Find.Highlight.getResults();
            var instance = App.InlineDoc.getMetaData();

            function wrapInDashes(index,ele) {
            	var node = $(ele);

                if (!node.parent().hasClass('sec-cbe-highlight-dashed')) {	
                    var spanNode = null;
                    var nodeName = node[0].nodeName.toLowerCase();
                    var cls = 'sec-cbe-highlight-inline'; // assume display:inline, work hard to make sure not a block
                    if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                    	xbrId = node.attr('name').split(':').join('_');
                		if (instance && instance.tag[xbrId].xbrlType == 'textBlockItemType') { // it was a textBlock
                			cls = 'sec-cbe-highlight-block';
                		} else { // does it have element descendants
                            $(node[0]).find('*').each(function() { // and there was a display:block in there
                        	    if ($(this).css('display')=='block') {
                        	        cls = 'sec-cbe-highlight-block';
                        	        return false; }});
                        	if (cls == 'sec-cbe-highlight-inline') { // last ditch effort based on current display only
                        		rect = node[0].getClientRects();
                            	if (rect.length > 1) { // it is drawn in two rectangles, it had to be a block.
                            		cls = 'sec-cbe-highlight-block';
                            		}}}}   	                            	    
                    var parentNode = node.parent()[0];
                    if (parentNode.nodeName.toLowerCase()=='span') //.search(App.InlineDoc.inlinePrefix)!=0
                    {
                        var isonly = parentNode.childNodes.length == 1;                        
                        if (isonly) {
                            spanNode = parentNode;
                        }  // no need to wrap.
                    }
                    if (spanNode == null) {
                        var nilPadding = '&#160;';
                    	node.wrap('<span>'+((node.attr('xsi:nil')=='true')?nilPadding:'')+'</span>');
                    	spanNode = node.parent()[0];
                    }
                    $(spanNode).addClass('sec-cbe-highlight-dashed ' + cls).attr('data-result-index',index).on('click', function(evt) {
                    	$('#about-modal').dialog("close");
                        if ($(this).hasClass('sec-cbe-highlight-dashed')||$(this).hasClass('sec-cbe-highlight-filter')) {
                    	    var index = $(this).attr('data-result-index');
                    		App_Find.Results.highlightItem(index);  // highlight the result item
                    		$(this).children(':first').selectionHighlight(); // highlight the element
                    		$(this).children(':first').each(function() {
                    		    App_Find.Element.showSelectionDetail($(this));
                    		});
                    		evt.stopPropagation();
                    	}
                    }).on('mousemove', function(event) {
                    	if(App_Find.Element.enableTooltip=="enable"){
                    		
	                    	if ($(this).hasClass('sec-cbe-highlight-dashed')||$(this).hasClass('sec-cbe-highlight-filter')) {
	                    		$(this).children(':first').each(function() {
	                    		    
	                                var container = $('#selection-detail-container-mouseOver');
	                                var maxValueTextLength = 50;
	                                var id = ele.attr('name');
	                                var xbrId = App_Utils.convertToXBRLId(id);
	
	                                var container = $('#selection-detail-container-mouseOver');
	
	                    			html = '<table class="table-framed-onHover">';
	
	                    			// xbrl value
	                                var xbrlValue = 'N/A';
	                                var nodeName = ele[0].nodeName.toLowerCase();
	                                if (nodeName == 'ix:nonfraction') {
	                                    xbrlValue = ele.getXbrlValue();
	                                    if (ele.attr('format') && xbrlValue=="-") { xbrlValue =  App_Utils.applyFormat(ele); }
	                                	xbrlValue = App_Utils.addCommas(xbrlValue);                    
	                                } else if (nodeName == 'ix:nonnumeric') {
	
	                                    xbrlValue = ele.htmlDecode(ele.text());
	                                    if (ele.attr('format')) { xbrlValue =  App_Utils.applyFormat(ele); }
	                                    if (xbrlValue.length > maxValueTextLength) {
	
	                                        xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';
	                                    }
	                                }
	                                container.find('[data-content="label"]').html(xbrlValue);
	                                if (!id) {
	
	                                    id = 'N/A';
	                                }
	                                var tag = ele.htmlDecode(id);
	                                if (tag.substring(0,8) == "us-gaap:") {
	                                tag = "<span style='white-space:nowrap;'>us-gaap:</span>"+tag.substring(8);
	                                }
	                                html += '<tr><td width="55px">Tag:</td><td><div class="wordBreakDiv">'+tag+'</div></td></tr>';
	                                
	                    			// calendar
	                                var contextRef = ele.attr('contextRef');
	                                if (!contextRef) {
	
	                                    contextRef = 'N/A';
	                                } else {
	
	                                    var context = App.InlineDoc.getContext(contextRef);
	                                    if (context.length == 1) {
	
	                                        contextRef = context.calendarFriendlyName();
	                                    }
	                                }
	                                html += '<tr><td width="55px">Period:</td><td><div class="wordBreakDiv">'+ele.htmlDecode(contextRef)+'</div></td></tr>';
	
	                    			 // unit
	                                var unit = 'N/A';
	                                var unitRef = ele.attr('unitRef');
	                                if (unitRef) {
	                                    var u = App.InlineDoc.getUnitById(unitRef);
	                                    if (u.length > 0) {
	                                        unit = u.unitFriendlyName();
	                                    }
	                                }
	                                if(unit !='N/A'){
	                                html += '<tr><td width="55px">Measure:</td><td><div class="wordBreakDiv">'+unit+'</div></td></tr>';
	                                }
	                                if(ele.scaleFriendlyName() !='N/A'){
	            					html += '<tr><td width="55px">Scale:</td><td><div class="wordBreakDiv">'+ele.scaleFriendlyName()+'</div></td></tr>';
	                                }
	                                if(ele.precisionFriendlyName() !='N/A'){
	                                html += '<tr><td width="55px">Decimals:</td><td><div class="wordBreakDiv">'+ele.precisionFriendlyName()+'</div></td></tr>';
	                                }
	                                // type
	                                var typeHTML = '';
	                                html += '</table>';
	                                $('#selection-detail-container-mouseOver').find('[data-content="attributes"]').html(html);        
	                                container.show();
	                    			
	                    			//App_Find.Element.showSelectionDetailOnHover($(this),event);
	                    		});
	                    	}
	                    	
	        				
	                    	 var container = $('#selection-detail-container-mouseOver');
	                            var panel = $('#app-panel1');
	                            var panel2 = $('#app-panel2');
	                            var marginLeft = event.clientX;
	                            var marginTop = event.clientY + 35;
	                            var panelWidth=0;

	                            if(panel.hasClass("visible") || panel2.hasClass("visible")){
	                            	panelWidth = (30/100)*(screen.width);
		        				}
	                           
	                          
	                            if(screen.width>1600 && screen.width < 1921){
		                    	if(event.clientX > (screen.width-1400)){
		                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
		        				}
		                    	else
	                    		{
	                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
	                    		var marginLeft = (event.clientX - container.width())+panelWidth;
	                    		}
	                    		}
	                            }
	                            if(screen.width>1440 && screen.width < 1601){
			                    	if(event.clientX > (screen.width-1200)){
			                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
			        				}
			                    	else
			                    		{
			                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
			                    		var marginLeft = (event.clientX - container.width())+panelWidth;
			                    		}
			                    		}
	                            	
			                        }
	                            if(screen.width>1366 && screen.width < 1441){

			                    	if(event.clientX > (screen.width-1000)){
			                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
			        				}
			                    	else
		                    		{
		                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
		                    		var marginLeft = (event.clientX - container.width())+panelWidth;
		                    		}
		                    		}
			                        }
	                            if(screen.width>1280 && screen.width < 1367){
			                    	if(event.clientX > (screen.width-900)){
			                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
			        				}
			                    	else
		                    		{
		                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
		                    		var marginLeft = (event.clientX - container.width())+panelWidth;
		                    		}
		                    		}
			                        }
	                            if(screen.width>1024 && screen.width < 1281){
			                    	if(event.clientX > (screen.width-800)){
			                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
			        				}
			                    	else
		                    		{
		                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
		                    		var marginLeft = (event.clientX - container.width())+panelWidth;
		                    		}
		                    		}
			                        }
	                            if(screen.width < 1025){
			                    	if(event.clientX > (screen.width-600)){
			                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
			        				}
			                    	else
		                    		{
		                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
		                    		var marginLeft = (event.clientX - container.width())+panelWidth;
		                    		}
		                    		}
			                        }
	                            
	                            if($('#filterDataDiv').height()>0){
	                            	if(event.clientY > (screen.height-500)){
	                            		var marginTop =( (event.clientY) - container.height())+$('#filterDataDiv').height()+25;
	                            	}
	                            	else
	                            		{
	                            		var marginTop =( (event.clientY+ $('#filterDataDiv').height()))+35;
	                            		}
	                            }
	                            else{
	                            	if(event.clientY > (screen.height-500)){
	                            		 var marginTop =(event.clientY - container.height())+25;
	                            	}
	                            }
	                    	
	                    	container.css('margin-left',marginLeft +'px');
	                    	container.css('margin-top', marginTop +'px');
	                    	event.stopPropagation();
                    	}
                    	
                    }).on('mouseout', function() {
                    	var container = $('#selection-detail-container-mouseOver');
                    	container.hide();
                    }).on('mouseenter', function(event) {
                    	if(App_Find.Element.enableTooltip=="enable"){
                    		
	                    	if ($(this).hasClass('sec-cbe-highlight-dashed')||$(this).hasClass('sec-cbe-highlight-filter')) {
	                    		$(this).children(':first').each(function() {
	                    		    
	                                var container = $('#selection-detail-container-mouseOver');
	                                var maxValueTextLength = 50;
	                                var id = ele.attr('name');
	                                var xbrId = App_Utils.convertToXBRLId(id);
	
	                                var container = $('#selection-detail-container-mouseOver');
	
	                    			html = '<table class="table-framed-onHover">';
	
	                    			// xbrl value
	                                var xbrlValue = 'N/A';
	                                var nodeName = ele[0].nodeName.toLowerCase();
	                                if (nodeName == 'ix:nonfraction') {
	                                    xbrlValue = ele.getXbrlValue();
	                                    if (ele.attr('format') && xbrlValue=="-") { xbrlValue =  App_Utils.applyFormat(ele); }
	                                	xbrlValue = App_Utils.addCommas(xbrlValue);                    
	                                } else if (nodeName == 'ix:nonnumeric') {
	
	                                    xbrlValue = ele.htmlDecode(ele.text());
	                                    if (ele.attr('format')) { xbrlValue =  App_Utils.applyFormat(ele); }
	                                    if (xbrlValue.length > maxValueTextLength) {
	
	                                        xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';
	                                    }
	                                }
	                                container.find('[data-content="label"]').html(xbrlValue);
	                                if (!id) {
	
	                                    id = 'N/A';
	                                }
	                                var tag = ele.htmlDecode(id);
	                                if (tag.substring(0,8) == "us-gaap:") {
	                                tag = "<span style='white-space:nowrap;'>us-gaap:</span>"+tag.substring(8);
	                                }
	                                html += '<tr><td width="55px">Tag</td><td><div class="wordBreakDiv">'+tag+'</div></td></tr>';
	                                
	                    			// calendar
	                                var contextRef = ele.attr('contextRef');
	                                if (!contextRef) {
	
	                                    contextRef = 'N/A';
	                                } else {
	
	                                    var context = App.InlineDoc.getContext(contextRef);
	                                    if (context.length == 1) {
	
	                                        contextRef = context.calendarFriendlyName();
	                                    }
	                                }
	                                html += '<tr><td width="55px">Period</td><td><div class="wordBreakDiv">'+ele.htmlDecode(contextRef)+'</div></td></tr>';
	
	                    			 // unit
	                                var unit = 'N/A';
	                                var unitRef = ele.attr('unitRef');
	                                if (unitRef) {
	                                    var u = App.InlineDoc.getUnitById(unitRef);
	                                    if (u.length > 0) {
	                                        unit = u.unitFriendlyName();
	                                    }
	                                }
	                                if(unit!='N/A'){
	                                html += '<tr><td width="55px">Measure</td><td><div class="wordBreakDiv">'+unit+'</div></td></tr>';
	                                }
	                                if(ele.scaleFriendlyName()!='N/A'){
	            					html += '<tr><td width="55px">Scale</td><td><div class="wordBreakDiv">'+ele.scaleFriendlyName()+'</div></td></tr>';
	                                }
	                                if(ele.precisionFriendlyName()!='N/A'){
	                                html += '<tr><td width="55px">Decimals</td><td><div class="wordBreakDiv">'+ele.precisionFriendlyName()+'</div></td></tr>';
	                                }
	                                // type
	                                var typeHTML = '';
	                                html += '</table>';
	                                $('#selection-detail-container-mouseOver').find('[data-content="attributes"]').html(html);        
	                                container.show();
	                    			
	                    			//App_Find.Element.showSelectionDetailOnHover($(this),event);
	                    		});
	                    	}
	                    	var container = $('#selection-detail-container-mouseOver');
                            var panel = $('#app-panel1');
                            var panel2 = $('#app-panel2');
                            var marginLeft = event.clientX;
                            var marginTop = event.clientY+35;
                            
                            var panelWidth=0;

                            if(panel.hasClass("visible") || panel2.hasClass("visible")){
                            	panelWidth = (30/100)*(screen.width);
	        				}
                            if(screen.width>1600 && screen.width < 1921){
    	                    	if(event.clientX > (screen.width-1400)){
    	                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
    	        				}
    	                    	else
                        		{
                        		if(panel.hasClass("visible") || panel2.hasClass("visible")){
                        		var marginLeft = (event.clientX - container.width())+panelWidth;
                        		}
                        		}
                                }
                                if(screen.width>1440 && screen.width < 1601){
                                	if(event.clientX > (screen.width-1200)){
			                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
			        				}
			                    	else
			                    		{
			                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
			                    		var marginLeft = (event.clientX - container.width())+panelWidth;
			                    		}
			                    		}
    		                        }
                                if(screen.width>1366 && screen.width < 1441){

    		                    	if(event.clientX > (screen.width-1000)){
    		                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
    		        				}
    		                    	else
    	                    		{
    	                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
    	                    		var marginLeft = (event.clientX - container.width())+panelWidth;
    	                    		}
    	                    		}
    		                        }
                                if(screen.width>1280 && screen.width < 1367){
    		                    	if(event.clientX > (screen.width-900)){
    		                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
    		        				}
    		                    	else
    	                    		{
    	                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
    	                    		var marginLeft = (event.clientX - container.width())+panelWidth;
    	                    		}
    	                    		}
    		                        }
                                if(screen.width>1024 && screen.width < 1281){
    		                    	if(event.clientX > (screen.width-800)){
    		                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
    		        				}
    		                    	else
    	                    		{
    	                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
    	                    		var marginLeft = (event.clientX - container.width())+panelWidth;
    	                    		}
    	                    		}
    		                        }
                                if(screen.width < 1025){
    		                    	if(event.clientX > (screen.width-600)){
    		                    		var marginLeft = (event.clientX - container.width())+panelWidth-5;
    		        				}
    		                    	else
    	                    		{
    	                    		if(panel.hasClass("visible") || panel2.hasClass("visible")){
    	                    		var marginLeft = (event.clientX - container.width())+panelWidth;
    	                    		}
    	                    		}
    		                        }
                        
                                if($('#filterDataDiv').height()>0){
                                	if(event.clientY > (screen.height-500)){
                                		var marginTop =( (event.clientY) - container.height())+$('#filterDataDiv').height()+25;
                                	}
                                	else
                                		{
                                		var marginTop =( (event.clientY+ $('#filterDataDiv').height()))+35;
                                		}
                                }
                                else{
                                	if(event.clientY > (screen.height-500)){
                                		 var marginTop =(event.clientY - container.height())+25;
                                	}
                                }
	                    	container.css('margin-left',marginLeft +'px');
	                    	container.css('margin-top', marginTop +'px');
	                    	event.stopPropagation();
                    	}
                    	
                    });
                }
            }

            // if we have no filters or search filters then just show the results
            if (!filter.isFiltered() &&
                search.searchStr == '') {
                // highlight the results
                results.each(function(index, element) {
                    wrapInDashes(index,element);
                });

                App_Find.Results.show(App_Find.Highlight.getResults());
            } else {
            	var highlightType = App_Find.Highlight.getSelected().value;
            
            	if(!filter.isFiltered() && (highlightType != 'none')){
            		results.each(function(index, element) {
	                    wrapInDashes(index,element);
	                });
            	}
                var results = [];
                App_Find.Highlight.getResults().each(function(index, element) {

                    var isMatch = false;
                    var ele = $(element);
                    if (filter.isFiltered()) {

                        if (ele.matchesFilter(filter, ele)) {
							wrapInDashes(index,element);
                            if (search.searchStr != '' &&
                                ele.matchesSearch(search, ele)) {

                                isMatch = true;
                            } else if (search.searchStr == '') {

                                isMatch = true;
                            }
                        }
                    } else if (search.searchStr != '' && ele.matchesSearch(search, ele)) {
                            var searchstring = search.searchStr;
                            isMatch = true;

                    }
                    if (isMatch) {

                        results.push(ele);
                        ele.filterHighlight(results.length - 1);
                        wrapInDashes(index,ele);
                        
                    }
                });
                App_Find.Results.show(results);
	            
            }
        },
        jsonlocation:function() {
        	var cnamejsonparse = undefined;
            var uri = URI(window.location.href);
            if (uri.hasQuery('file')) {
            	//cnamejsonparse = "../documents/"+uri.query(true).file.split('/')[0];
            	cnamejsonparse = uri.query(true).file.split('/')[0];
            } else if (uri.hasQuery('doc')) {
            	cnamejsonparse = URI(uri.query(true).doc).filename("").toString();
            }
            return cnamejsonparse;
        },
        show:function(results) {
        	var maxValueTextLength = 100;
            var searchResults = $('#results');
            if (results) {
                App.frame.contents().find('.sec-cbe-highlight-filter-selected').removeClass('sec-cbe-highlight-filter-selected');
                if($('#search-input').val() == "") {
                    App.frame.contents().find('.sec-cbe-highlight-filter').removeClass('sec-cbe-highlight-filter');
                }
                searchResults.html('');
                App_Find.Results.currentPage = 1;
                App_Find.Results.totalPages = 0;
                App_Find.Results.results = null;                
                App_Find.Results.results = $(results); // load
                App_Find.Results.totalPages = Math.ceil(App_Find.Results.results.length/App_Find.Results.resultsPerPage);
                if (results.length == 0) { App_Find.Results.currentPage = 0; }
            }
            if (App_Find.Results.totalPages == 0) { App_Find.Results.currentPage = 0; }
            $('#results-pages').html(App_Find.Results.currentPage + ' of ' + App_Find.Results.totalPages);
	    if(App_Find.Results.results.length==0){
					
				var panel = $('#app-panel');
				if(panel.hasClass("visible")){
				if(screen.width<641)
					{
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("title", "Expand Facts");
					panel.removeClass('visible').animate({'margin-right':'-100%','width':'100%'});
		      		$('#app-inline-xbrl-doc').css({'width':'100%'});
					}
				else{
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("title", "Expand Facts");
					panel.removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
					panel.css({'width':'100%'});
		      		$('#app-inline-xbrl-doc').css({'width':'100%'});
				}
				}
			}
            $('#results-count').html('' + App_Find.Results.results.length + '');
            App.InlineDoc.getStandardLabels(this,function(labels){
              App_Find.Results.results.each(function(index, element) {
                if (index < (App_Find.Results.currentPage * App_Find.Results.resultsPerPage) &&
                   index >= ((App_Find.Results.currentPage * App_Find.Results.resultsPerPage) - App_Find.Results.resultsPerPage)) {
                   var e = $(element);                   
                   var xbrlValue = 'N/A';
		           var nodeName = e[0].nodeName.toLowerCase();
		           if (nodeName == 'ix:nonfraction') {
		        	   xbrlValue = e.getXbrlValue();
		        	   // if (e.attr('format') && xbrlValue=="-") { xbrlValue =  App_Utils.formatAsNumber(e); }
	                   xbrlValue = App_Utils.addCommas(xbrlValue);		               
		           } else if (nodeName == 'ix:nonnumeric') {		
		               xbrlValue = e.htmlDecode(e.text());
		               // if (e.attr('format')) { xbrlValue = App_Utils.applyFormat(e); }
                       if (xbrlValue.length > maxValueTextLength) {
                           // some of the hidden items contain html entities which is being seen as text
                           // therefore in order to get the text we have to re-parse it as html and grab the text
                           //xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';
                           //This will remove extra white spaces. Will uncomment this if required in future
                           //xbrlValue = xbrlValue.replace(/\s{2,}/g,' ');
                       }
		           }
                   var contextRef = e.attr('contextRef');
		           if (!contextRef) { contextRef = 'N/A';
		           } else {		
		               var context = App.InlineDoc.getContext(contextRef);
		               if (context.length == 1) { 
		               		contextRef = context.calendarFriendlyName();
		               }
		           }    
                   var resultHtml = '<div class="result-item" data-is-selected="false" data-result-index="' + index + '">'
                   //resultHtml += '<div class="rightNavLinks">';
                   resultHtml += '<div tabindex="0" class="rightNavLinks" style="float:none;font-weight:normal;">';
                   var id = App_Utils.convertToXBRLId(e.attr('name'));
                   var label = labels[id];
                   if (!label) label=id;
                   finallabelresult = e.htmlDecode(label);
                   var dimensions = App_Find.Element.getDimensionsForElement(e);
                   
                   if (!(e.isHidden())&&(!(e.isCustom()))&&(dimensions.length <= 0)){
                	   
                	   resultHtml += '<span id="labelWithoutButtons"><b>'+finallabelresult+'</b></span>';
                	   
		        	   
		           }else if((e.isHidden())&&((e.isCustom()))&&(dimensions.length >0)){
		        	   
		        	   resultHtml += '<span id="labelWithThreeButton"><b>'+finallabelresult+'</b></span>';
		        	   resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Additional | Custom | Dimension">A | C | D</button> </div>';
		        	   
		           }else if((e.isHidden())&&(e.isCustom())&&(dimensions.length <=0)){
		        	   
		        	   resultHtml += '<span id="labelWithBothButtons"><b>'+finallabelresult+'</b></span>';
		        	   resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Additional | Custom">A | C</button> </div>';
		        	   
		           }else if((!e.isHidden() && e.isCustom())&&(dimensions.length >0)){
		        	   
		        	   resultHtml += '<span id="labelWithBothButtons"><b>'+finallabelresult+'</b></span>';
		        	   resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Custom | Dimension">C | D</button> </div>';
		        	   
		           }else if((e.isHidden())&&((!e.isCustom()))&&(dimensions.length >0)){
	   
		        	   resultHtml += '<span id="labelWithBothButtons"><b>'+finallabelresult+'</b></span>';
		        	   resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Additional | Dimension">A | D</button> </div>';
	   
		           }else{
		        	   
		        	   resultHtml += '<span id="labelWithOneButton"><b>'+finallabelresult+'</b></span>';
		        	   if (e.isCustom()) {
	                   		resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Custom">C</button> </div>'; 
	                   } 
	                   if (e.isHidden()) { 
	                   		resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"><button class="customButton" title="Additional">A</button> </div>'; 
	                   } 

	       			   if (dimensions.length > 0) {

	       				resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Dimension">D</button> </div>'; 
	                   }
		        	   
		           }
                   
                   
                   /*
                   if ((e.isHidden())||(e.isCustom())){
		               if((window.orientation) || (window.orientation=='0')){
		                   if (!(Math.abs(window.orientation) === 90) && (screen.width > 640) && (screen.width < 769)) {
						        if (finallabelresult.length > 12) { finallabelresult = finallabelresult.trim().substring(0, 12) + '...'; }
						    } 
						    else if((Math.abs(window.orientation) === 90) && (screen.width <= 640)){
						    	if((e.isHidden())&&(e.isCustom())){
						    		if (finallabelresult.length > 8) { finallabelresult = finallabelresult.trim().substring(0, 8) + '...'; }
						    	}else{
						    		if (finallabelresult.length > 12) { finallabelresult = finallabelresult.trim().substring(0, 12) + '...'; }
						    	}
						    }
					   }
		           }*/
                   
                   
                   resultHtml += '<br/> '+contextRef+ '<br/><span id="xbrlValueSpan">'+ xbrlValue + '</span>';
                   resultHtml +=  '</div></div>';   
                   var resultHtmlObj = $(resultHtml);
                   resultHtmlObj.on('click', function() {
                	   App_Find.Results.selectItem($(this).attr('data-result-index'), true);});
                	   
                   resultHtmlObj.on('keyup', function(e) {                  
                	   var code = e.keyCode || e.which;                	   
                  		if((code == 13) || (code == 32)) {                   		
                	   App_Find.Results.selectItem($(this).attr('data-result-index'), true);
                	   }
                  	});    
                  	
                   searchResults.append(resultHtmlObj);
                } // end if
              }); // end function // end reseults.each
            }); // end getStandardLabels
        }, // end Results.show
    }, // end Results


    Element:{
        labels:null,
        element:null,
        enableTooltip:'enable',
        carouselItems:[
            { subTitle:'Attributes' },
            { subTitle:'Labels' },
            { subTitle:'References' },
            { subTitle:'Calculation' },
            { subTitle:'Additional Guidance' }
        ],
        init:function() {

            $('#selection-detail-carousel').carousel({
                interval:false
            }).on('slide.bs.carousel', function (event) {

                var index = $(event.relatedTarget).attr('data-slide-index');
                App_Find.Element.carouselGoTo(index);
            });

            var header = $('#selection-detail-container > .selection-detail-header');
            header.find('.btn-copy').on('click', function() {
                App_Find.Element.copyToClipboard();
            });

            header.find('.btn-remove').on('click', function() {

                App.frame.contents().find('.sec-cbe-highlight-filter-selected').removeClass('sec-cbe-highlight-filter-selected');
                //$(this).parents('.selection-detail-container').hide('slide');
                $(this).parents('.selection-detail-container').dialog("close");
                App_Find.Results.resetHighlightColor();

            });
            
         // change highlight type or concept type
            $('#tagTooltip').find('input[type="radio"]').on('change', function() {
            	var selected = $("input[type='radio'][name='toolTip']:checked");
            	if (selected.length > 0) {
            		App_Find.Element.enableTooltip = selected.val();
            	}
            });
            if (screen.width < 641) {
            	App_Find.Element.enableTooltip = "disable";
            	$('#tagTooltip').css({'display':'none'});
			}
			  if ((screen.width) <= 768 && (window.orientation) && (window.orientation == 90 || window.orientation == -90)) {
            	App_Find.Element.enableTooltip = "disable";
            	$('#tagTooltip').css({'display':'none'});
			}
			 if ((screen.width) <= 768 && (window.orientation ==0 || window.orientation == 180)) {
            	App_Find.Element.enableTooltip = "disable";
            	$('#tagTooltip').css({'display':'none'});
			}
        },
        resetUI:function() {

            App_Find.Element.labels = null;
            $('#selection-detail-container').find('[data-content]').each(function(index, element) {

                $(element).html('');
            });
        },
        showSelectionDetail:function(ele) {

            App_Find.Element.element = ele;
            App_Find.Element.resetUI();
            var container = $('#selection-detail-container');
            
            $('#selection-detail-carousel').carousel(0);
            App_Find.Element.carouselGoTo(0);
            container.dialog("open");
            
            /*Added to handle pop up drag out of parent window*/
            var draggableParams={
                	containment: '#app-container',
                	zIndex: 1500,
                	appendTo: '#page'
                }
            container.draggable(draggableParams);
            
            //container.show('slide', function() {
			/*container.dialog("open", function() {
                $('#selection-detail-carousel').carousel(0);
                App_Find.Element.carouselGoTo(0);
            });*/
        },
        carouselGoTo:function(index) {

            index = parseInt(index);
            if((App.InlineDoc.getMetaMoreData() =="Not Found")){
            	App_Find.Element.carouselItems.length=4;
				$("#lnk5,#div5").remove();
        	}
            if (index >= 0 && index < App_Find.Element.carouselItems.length) {

                var nextIndex = index + 1;
                var prevIndex = index - 1;
                if (index == 0) {

                    nextIndex = 1;
                    prevIndex = App_Find.Element.carouselItems.length - 1;
                } else if (index >= (App_Find.Element.carouselItems.length - 1)) {

                    nextIndex = 0;
                    prevIndex = App_Find.Element.carouselItems.length - 2;
                }

                var currentItem = App_Find.Element.carouselItems[index];
                var nextItem = App_Find.Element.carouselItems[nextIndex];
                var prevItem = App_Find.Element.carouselItems[prevIndex];

                var carousel = $('#selection-detail-carousel');
                carousel.find('.carousel-label.left').html(prevItem.subTitle);
                carousel.find('.carousel-label.right').html(nextItem.subTitle);

                var container = $('#selection-detail-container');
                container.find('span[data-content="subtitle"]').html(currentItem.subTitle);
            	/*if(App.InlineDoc.getMetaMoreData() =="Not Found"){
            		$("#lnk5,#div5").remove();
            	}*/
                switch(parseInt(index)) {
                    case 0:
                        App_Find.Element.updateSelectionDetail();
                        break;
                    case 1:
                        if (container.find('[data-content="labels"]').html() == '') {

                            App_Find.Element.updateDefinition();
                        }
                        break;
                    case 2:
                        if (container.find('[data-content="reference"]').html() == '') {
                            App_Find.Element.updateReference();
                        }
                        break;
                    case 3:
                        App_Find.Element.updateCalculation();
                        break;
                    /*Fifth review window code
                     case 4:
                        if (container.find('[data-content="custom"]').html() == '') {
                            App_Find.Element.updateCustomDetail();
                        }
                        break;*/
                }
            }
        },
        typeHTML:'',
        updateSelectionDetail:function() {
        			var maxValueTextLength = 256;
                    var ele = App_Find.Element.element;
                    var id = ele.attr('name');
                    var xbrId = App_Utils.convertToXBRLId(id);

                    var container = $('#selection-detail-container');


        			html = '<table class="table-framed">';


                     var selectedlabelval = App.InlineDoc.getSelectedLabel(xbrId,this,null,function(value){

                      container.find('[data-content="label"]').html(value);
                    });

                    
                    if (!id) {

                        id = 'N/A';
                    }
                    var tag = ele.htmlDecode(id);
                    if (tag.substring(0,8) == "us-gaap:") {
                    tag = "<span style='white-space:nowrap;'>us-gaap:</span>"+tag.substring(8);
                    }
                    if(tag !='N/A')
                    	{
                       html += '<tr><td width="35%">Tag</td><td width="65%"><div class="wordBreakDiv">'+tag+'</div></td></tr>';
                    	}
                    //html += '<tr><td width="35%">Tag</td><td width="65%"><div class="wordBreakDiv">'+ele.htmlDecode(id)+'</div></td></tr>';


        			// xbrl value
                    var xbrlValue = 'N/A';
                    var nodeName = ele[0].nodeName.toLowerCase();
                    if (nodeName == 'ix:nonfraction') {
                        xbrlValue = ele.getXbrlValue();
                        if (ele.attr('format') && xbrlValue=="-") { xbrlValue =  App_Utils.applyFormat(ele); }
                    	xbrlValue = App_Utils.addCommas(xbrlValue);                    
                    } else if (nodeName == 'ix:nonnumeric') {

                        xbrlValue = ele.htmlDecode(ele.text());
                        if (ele.attr('format')) { xbrlValue =  App_Utils.applyFormat(ele); }
                        if (xbrlValue.length > maxValueTextLength) {

                            // some of the hidden items contain html entities which is being seen as text
                            // therefore in order to get the text we have to re-parse it as html and grab the text
                            xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';

                            //This will remove extra white spaces. Will uncomment this if required in future
                            //xbrlValue = xbrlValue.replace(/\s{2,}/g,' ');
                        }
                    }
                    if(xbrlValue != 'N/A')
                    	{
        			     html += '<tr><td width="35%">Fact</td><td width="65%"><div class="wordBreakDiv">'+xbrlValue+'</div></td></tr>';
                    	}
        			var dimensions = App_Find.Element.getDimensionsForElement(ele);

        			if (dimensions.length > 0) {

                        for(var k in dimensions) {
                        	if(ele.htmlDecode(dimensions[k].axis)!='N/A'){
        					html += '<tr><td width="35%">Axis</td><td width="65%"><div class="wordBreakDiv">'+ele.htmlDecode(dimensions[k].axis)+'</div></td></tr>';
                        	}
                        	if(ele.htmlDecode(dimensions[k].member)!='N/A'){
        					html += '<tr><td width="35%">Member</td><td width="65%"><div class="wordBreakDiv">'+ele.htmlDecode(dimensions[k].member)+'</div></td></tr>';
                        	}
                        }
                    }

        			// calendar
                    var contextRef = ele.attr('contextRef');
                    if (!contextRef) {

                        contextRef = 'N/A';
                    } else {

                        var context = App.InlineDoc.getContext(contextRef);
                        if (context.length == 1) {

                            contextRef = context.calendarFriendlyName();
                        }
                    }
                    if(ele.htmlDecode(contextRef)!='N/A'){
                    html += '<tr><td width="35%">Period</td><td width="65%"><div class="wordBreakDiv">'+ele.htmlDecode(contextRef)+'</div></td></tr>';
                    }
        			 // unit
                    var unit = 'N/A';
                    var unitRef = ele.attr('unitRef');
                    
                    if (unitRef) {
                        var u = App.InlineDoc.getUnitById(unitRef);
                        if (u.length > 0) {
                            unit = u.unitFriendlyName();
                        }
                    }
                    if(unit != 'N/A')
                      {
                    	html += '<tr><td width="35%">Measure</td><td width="65%"><div class="wordBreakDiv">'+unit+'</div></td></tr>';
                      }
                    if(ele.scaleFriendlyName() != 'N/A')
                      {
                    	html += '<tr><td width="35%">Scale</td><td width="65%"><div class="wordBreakDiv">'+ele.scaleFriendlyName()+'</div></td></tr>';
                      }
                    if(ele.precisionFriendlyName() != 'N/A')
                      {
                    	html += '<tr><td width="35%">Decimals</td><td width="65%"><div class="wordBreakDiv">'+ele.precisionFriendlyName()+'</div></td></tr>';
                      }
                    if (App.InlineDoc.getMetaData()) {
        				balance = App.InlineDoc.getMetaData().tag[xbrId].crdr;
        				if (balance) {
        					html += '<tr><td width="35%">Balance</td><td width="65%"><div class="wordBreakDiv" style="text-transform: capitalize">'+balance+'</div></td></tr>';
        				}/*else{
        					html += '<tr><td width="35%">Balance</td><td width="65%"><div class="wordBreakDiv">N/A</div></td></tr>';
        				}*/
        			} 

					 // footnote
                    var signHtml = 'N/A';
                    if (nodeName == 'ix:nonfraction') {
                        if (ele.attr('sign') == '-') {
	                        signHtml = "Negative";
	                    }else{
	                    	signHtml = "Positive";
	                    }           
                    }
                    if(signHtml != 'N/A')
                      {
                       html += '<tr><td width="35%">Sign</td><td width="65%"><div class="wordBreakDiv">'+signHtml+'</div></td></tr>';
                      }
                    
                     // footnote
                    var footnoteHtml = 'N/A';
                    if (ele.attr('id')) {

                        var footnote = ele.htmlDecode(App.InlineDoc.getFootnote(ele.attr('id')));
                        if (footnote.length != '') {

                            footnoteHtml = footnote.substring(0, maxValueTextLength) + '...';
                        }
                    }
                    if(footnoteHtml != 'N/A')
                       {
                        html += '<tr><td width="35%">Fact Footnote</td><td width="65%"><div class="wordBreakDiv">'+footnoteHtml+'</div></td></tr>';
                       }
                    // type
                    var typeHTML = '';
                    var type = App.InlineDoc.getIdTypes(xbrId, this, null,function(value,callback) {
                        html += '<tr><td width="35%">Type</td><td width="65%">'+ele.htmlDecode(value)+'</td></tr>';
                        if (ele.attr('format')) {
                            formatAry = ele.attr('format').split(':').slice(-1);
                            html += '<tr><td width="35%">Format</td><td width="65%">'+ele.htmlDecode(formatAry[0])+'</td></tr>';
                        };
                        if(callback) {callback.apply(value,[html]);};
                    });
                    html += '</table>';
                    $('.selection-detail-container').find('[data-content="attributes"]').html(html);                    
                },
        labelDocHTML:'',
        labelsJSON:{},
        updateDefinition:function(parent,callback) {
            if (!App.InlineDoc.getMetaData()) return;
            var ele = App_Find.Element.element;
	        var xbrlId = App_Utils.convertToXBRLId(ele.attr('name'));
	        var rows = "";
	        var roles = App.InlineDoc.getMetaData().tag[xbrlId].lang['en-US'].role;
	        var definition = roles['documentation'];
	        if (definition) {
	            rows += '<tr><td width="35%">Definition</td><td width="65%"><div class="wordBreakDiv">'+ele.htmlDecode(definition)+'</div></td></tr>';
	            html = '<table class="table-framed">' + rows + '</table>';
	            $('.selection-detail-container').find('[data-content="labels"]').html(html);
	            //if(callback) callback.apply(parent,[html]);
	        }
	        for (role in roles) {
	        	if (role != "documentation") {
	        		var label = roles[role];
	        		rows += '<tr><td width="35%">'+role+'</td><td width="65%"><div class="wordBreakDiv">'+ele.htmlDecode(label)+'</div></td></tr>';
	        	}
	        }
	        html = '<table class="table-framed">' + rows + '</table><br/>';
            $('.selection-detail-container').find('[data-content="labels"]').html(html);
	        if(callback) callback.apply(parent,[html]);
        },
        CalculationValuesJSON:{},
        updateCalculation:function(parent,callback) {
        	var ele = App_Find.Element.element;
        	var xbrlId = ele.convertNameToXBRLId();
        	var container = $('.selection-detail-container');
	        //var dimensions = App_Find.Element.getDimensionsForElement(ele);
    	    var result = App.InlineDoc.getMetaLinks();
      		if (!result) {
      			var token =  App.loadStatuses.failed;
  	            this.CalculationValuesJSON.section = token;
	            this.CalculationValuesJSON.parent = token;
	            this.CalculationValuesJSON.weight = token;
	            this.CalculationValuesJSON.balance = token;
      		} else {
      			var token = 'N/A';
    	        this.CalculationValuesJSON.section = token;
  	            this.CalculationValuesJSON.parent = token;
  	            this.CalculationValuesJSON.weight = token;
  	            this.CalculationValuesJSON.balance = token;
  	            container.find('[data-content="section"]').html(this.CalculationValuesJSON.section);
                container.find('[data-content="parent"]').html(this.CalculationValuesJSON.parent);
                container.find('[data-content="weight"]').html(this.CalculationValuesJSON.weight);
                container.find('[data-content="balance"]').html(this.CalculationValuesJSON.balance);
  	            App.InlineDoc.getCalculationJSON(xbrlId,this,function(value){
      				this.CalculationValuesJSON = value;
      				container.find('[data-content="section"]').html(this.CalculationValuesJSON.section);
      				container.find('[data-content="parent"]').html(this.CalculationValuesJSON.parent);
      				container.find('[data-content="weight"]').html(this.CalculationValuesJSON.weight);
      				container.find('[data-content="balance"]').html(this.CalculationValuesJSON.balance);

  	            });
  	            if(callback) callback.apply(parent,[this.CalculationValuesJSON]);
  	        }
        },

        reference:{},
        refnum:[],
        updateReference:function(parent,callback){
        	var result = App.InlineDoc.getMetaLinks();
        	if (!result) return;
        	var ele = App_Find.Element.element;
        	var xbrlId = ele.convertNameToXBRLId();
        	var auth_refArray = App.InlineDoc.getMetaData().tag[xbrlId].auth_ref;
        	var std_refs = App.InlineDoc.getMetaRefs();
        	var count = 0, rows = "";
        	for (var ref_idx in auth_refArray) {
        		if (count>0) {
        			rows +=  "<tr style='empty-cells: hide;'><td colspan='2'></td></tr>";
        		}
        		count++;
        		ref_id = auth_refArray[ref_idx];
        		ref_parts = std_refs[ref_id];
        		for (ref_key in ref_parts) {
        			ref_value = ref_parts[ref_key];
        			rows += '<tr>'+'<td width="35%">'+ ele.htmlDecode(ref_key)+ '</td>'+'<td width="65%"><div class="wordBreakDiv">';
        			if (ref_key == "URI") {
        				ref_value = '<a href = '+encodeURI(ref_value)+' target="_blank">'+ref_value+'</a>';
        			} 
        			rows += ref_value + '</div></td>'+'</tr>';
        		}
        	}
        	var html = "";
        	if (count == 0) {
        		html = "No Data";
        	} else {
        		html = "<table class = 'table-framed'>"+rows+"</table><br/>";
        	}
        	$('.selection-detail-container').find('[data-content="reference"]').html(html);
        	if(callback) callback.apply(this,[html]);
        },
        typeHTML:'',
        CustomJSON:{},
        updateCustomDetail:function(parent,callback) {

        	var result = App.InlineDoc.getMetaLinks();
        	if (!result) return;
        	     var ele = App_Find.Element.element;
        	     var xbrlId = ele.convertNameToXBRLId();
        	     var custom_refArray = App.InlineDoc.getMetaData().tag[xbrlId].custom;
        	     var customLinks = App.InlineDoc.getMetaMoreData();
        	     var count = 0;
        	     var rows1="";
                 var html1="";
        	     var container = $('#selection-detail-container');
        	     for (var custom_idx in custom_refArray) {
        	    	 if (count>0) {
             			rows1 +=  "<tr style='empty-cells: hide;'><td colspan='2'></td></tr>";
             		}
             		count++;
             		custom_id = custom_refArray[custom_idx];
             		custom_parts = customLinks[custom_id];
             		var customLink=App.InlineDoc.getSelectedCustomData(xbrId,this,null,function(value){});
             		for (custom_key in custom_parts) {
             			custom_value = custom_parts[custom_key];
             			 var customValue=custom_value;
                     	 for(var i=0;i<customValue.length;i++)
                    		 {
                    		 if(customValue[i]=="2")
                    			 {
                    			 arr1=customValue.splice(i+1,customValue.length);
                    			 arr2=arr1.splice(i+1,arr1.length);
                    			 for(var n=0;n<arr1.length;n++)
                				 {
                			       rows1 += '<tr>'+'<td width="35%">'+ arr1[n]+ '</td>'+'<td width="65%"> '+ arr1[n+1] +'</td>';
                			       n=n+1;
                				 }
                    			 arr3=arr2.splice(i,arr2.length);
                    			 for(var j=0;j<arr3.length;j++)
                				 {
                			      rows1 += '<tr>'+'<td width="35%">'+ arr3[j]+ '</td>'+'<td width="65%"> '+ arr3[j+1] +'</td>';
                			      j=j+1;
                				 }
                    			 }
                    		 }
            		}
             	}
        	     
             	if (count == 0) {
             		html1 = "No Data";
             	} else {
             		html1 = "<table class = 'table-framed'>"+rows1+"</table><br/>";
             	}
             	container.find('[data-content="custom"]').html(html1);
   			    if(callback) callback.apply(this,[html1]);
                },
        getLabelFromLabels:function(labels) {

            var labelHTML = null;
            if (labels &&
                labels.length > 0) {

                labels.each(function(index, element) {

                    var node = $(element);
                    if (node.attr('xlink:role') == App.XBRLDoc.namespaces.label.label) {


                        labelHTML = node.text();
                        if (node.attr('xlink:label').split('_')[0] == App.InlineDoc.customPrefix) {

                            labelHTML = '*' + labelHTML;
                        }
                        return false;
                    }
                });
            }
            return labelHTML;
        },
        getDimensionsForElement:function(ele) {

            var dimensions = [];
            var contextRef = ele.attr('contextRef');
            var segments = App.InlineDoc.getSegmentsForContext(contextRef);
            segments.each(function(index, element) {

                $(element).children().each(function(index, element) {

                    var node = $(element);

                    // axis label
                    var axisLabel = node.attr('dimension');
                    var axislval = App.InlineDoc.getSelectedLabel(App_Utils.convertToXBRLId(axisLabel),this,null,function(value){

                            axisLabel = value + ' - ' + axisLabel;
                            return false;

                    });


                    // member label
                    var memberLabel = node.html();
                    var memberlval = App.InlineDoc.getSelectedLabel(App_Utils.convertToXBRLId(memberLabel),this,null,function(value){

                            memberLabel = value + ' - ' + memberLabel;
                            return false;

                    });


                    dimensions.push({
                        axis:axisLabel,
                        member:memberLabel
                    });
                });
            });

            return dimensions;
        },
        copyToClipboard:function() {

            var clipboardText = '';
            var container = $('#selection-detail-container');

            // get attributes
            clipboardText +=  "ATTRIBUTES \n";

            container.find('div[data-slide-index="0"] tr').each(function(index, element) {
            	var x=0;
                $(this).find('td').each (function(index, element) {
            	    var node = $(element);

            	    var myStr = node.text();

            	    if(node.text().indexOf('...')>-1){
            	        myStr = myStr.replace(/\s{2,}/g,' ');
            	    }
            	    
            	    if(x<1){
            	    	clipboardText +=  myStr;
            	    }else{
            	    	if(node.text()=="debit"){
            	    		clipboardText += ":&nbsp;&nbsp;" +"Debit";
            	    	}else if(node.text()=="credit"){
            	    		clipboardText += ":&nbsp;&nbsp;" +"Credit";
            	    	}else{
            	    		clipboardText +=  ":&nbsp;&nbsp;" +myStr;
            	    	}
            	    	
            	    }
            		x++;
            	});

                clipboardText +=  "\n";
            });
            
            // get definition and label information
            App_Find.Element.updateDefinition(this,function(value){
            	clipboardText +=  "\nLABELS \n";
                $('#selection-detail-container').find('div[data-slide-index="1"]').find('tr').each(function(index, element) {
                	var x=0;
                    $(this).find('td').each (function(index, element) {
                        var node = $(element);
                        if(x<1){
                        	clipboardText += node.text()+":&nbsp;&nbsp;" ;
                	    }else{
                	    	clipboardText += node.text();
                	    }
                		x++;
                    });
                    clipboardText+="\n";

                });

            });


            //get references
            App_Find.Element.updateReference(this,function(value){
                clipboardText +=  "\nREFERENCES \n";
                if($('#selection-detail-container').find('div[data-slide-index="2"]').text() != "No Data"){
                    $('#selection-detail-container').find('div[data-slide-index="2"]').find('tr').each(function(index, element) {
                    	var x=0;
                        $(this).find('td').each (function(index, element) {
                            var node = $(element);
                            if(node.text()){
	                            if(x<1){
	                            	clipboardText += node.text()+":&nbsp;&nbsp;" ;
	                    	    }else{
	                    	    	clipboardText += node.text();
	                    	    }
                            }
                    		x++;
                        });
                        clipboardText+="\n";
                    });
                }
                else{
                    clipboardText+=" No Data\n";
                }

            });

            // get calculation

            App_Find.Element.updateCalculation(this,function(value){
                clipboardText +=  "\nCALCULATION \n";
                $('#selection-detail-container').find('div[data-slide-index="3"]').find('tr').each(function(index, element) {
                	var x=0;
                    $(this).find('td').each (function(index, element) {
                        var node = $(element);
                        if(x<1){
                        	clipboardText += node.text()+":&nbsp;&nbsp;" ;
                	    }else{
                	    	if(node.text().trim()=="debit"){
                	    		clipboardText += "Debit";
                	    	}else if(node.text().trim()=="credit"){
                	    		clipboardText += "Credit";
                	    	}else{
                	    		clipboardText += node.text().replace(/\s+/g," ").replace(/^\s|\s$/g,"");
                	    	}
                	    }
                		x++;
                    });
                    clipboardText+="\n";
                });
            });

            var myWindow = window.open("", "MsgWindow", "toolbar=no, scrollbars=yes, resizable=yes, top=200, left=500, width=400, height=400");
			
			myWindow.document.write("<html><head><title>Copy All</title></head><body><textarea id='popTxtArea' rows='25' cols='50'>"+clipboardText+"</textarea></body></html>");
			myWindow.focus();
			myWindow.document.getElementById("popTxtArea").focus();
			myWindow.document.getElementById("popTxtArea").select();
        }
    }
};