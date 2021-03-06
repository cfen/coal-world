var circleScaleFactor = 10, globalStroke="#DCDCDC", globalCircleClip, globalCircleClipInner, globalFill = produceColor = "#005689", consumeColor = "#005689",  importColor = "#4bc6df", exportColor = "#4bc6df", globalStatsTitle="Global", futureColor="#767676",   minCircleSize = 30;
var dataset, datasetProductionConsumption, dataSetFuture, datasetImportExport, dataSetTrade, dataSetGlobalKeyStats, data, focusArray,projection,svg, prodConArr, yearCapsArray, yearCompareStr="y1980", globalYear=1980;
var pastYears = ['1980','1981','1982','1983','1984','1985','1986','1987','1988','1989','1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012'];    
var futureYears = ['2015','2020','2025','2030','2035','2040'];

var isMobile;

var allYears = pastYears;

var startYear = "y"+pastYears[0];

var globalFilter; // these are set in the datasheet - used to distinguish between production consumption values or import export values

var timeSlider;

var makeUnselectable = function( $target ) {
    $target
        .addClass( 'unselectable' ) // All these attributes are inheritable
        .attr( 'unselectable', 'on' ) // For IE9 - This property is not inherited, needs to be placed onto everything
        .attr( 'draggable', 'false' ) // For moz and webkit, although Firefox 16 ignores this when -moz-user-select: none; is set, it's like these properties are mutually exclusive, seems to be a bug.
        .on( 'dragstart', function() { return false; } );  // Needed since Firefox 16 seems to ingore the 'draggable' attribute we just applied above when '-moz-user-select: none' is applied to the CSS 

    $target // Apply non-inheritable properties to the child elements
        .find( '*' )
        .attr( 'draggable', 'false' )
        .attr( 'unselectable', 'on' ); 
    };

    iframeMessenger.enableAutoResize();

    var links = document.querySelectorAll('a');

        for(var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function(event) {
                event.preventDefault();
                iframeMessenger.navigate(this.href);
            }, false);
    }

$(function() {

if(!Array.indexOf) {// IE fix
    Array.prototype.indexOf = function(obj) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === obj) {
                return i;
            }
        }
        return -1;
    }
}
});


function init() {

    $(document).ready(function() {
        $('#graphHolder').hide();
        $('#graphic-holder').hide();
        $('#button-holder').hide();
        $('#drop-down-holder').hide();

        var windowWidth = $(window).width();

        if (windowWidth < 900){
            isMobile = true;
        }

        if (windowWidth > 900){
            isMobile = false;
        }

        if(!isMobile){
        $('#graphic-holder').show();
        $('#button-holder').show();
        }
        if(isMobile){
        $('#graphHolder').show();
        $('#drop-down-holder').show();
        }
    });

    "use strict";
    
    var key = "1qZiBAmCI6OQOE2e5Bds-uwa8sHORYUIvkWK2ky_jnyg";               
    var urlLocal = "js/data.json";
    var url = "http://interactive.guim.co.uk/spreadsheetdata/1qZiBAmCI6OQOE2e5Bds-uwa8sHORYUIvkWK2ky_jnyg.json";
    
    $.getJSON(url, handleResponse);

    globalFilter = "f_productionAndConsumption";



    adjustLayout();

}


function handleResponse(data) {
   
    datasetProductionConsumption = data.sheets.Production_Consumption_Top_Countries;

    datasetImportExport = data.sheets.Import_Export_Top_Countries;

    yearCapsArray= data.sheets.Year_captions;

    dataSetGlobalKeyStats = data.sheets.Key_stats_global;

    dataSetCountryKeyStats = data.sheets.Key_Stats_Countries;

    datasetTrade= data.sheets.Trade_Network;

    dataSetFuture = data.sheets.Future_Production_consumption;

    focusArray = datasetProductionConsumption;
    
    getYearData("1980");
    
    buildView();

}


function buildView(){



    renderSlider();
    addListeners();

    $('.buttonnav-selected').css('background-color',globalFill)

    globalFilter = "f_production";
    globalFill = produceColor;
    circleScaleFactor = 10;


    if (!isMobile){
            addMap();
            addCirclesToMap();
        }


      addKeyColors();

      $('#loading').hide();

}


function addMap(){
   
    var width = $("#graphic-holder").width();
    var height;
    var scalefactor = width/2/Math.PI; //width / 13;

    if (width > 1200){
        height = width * 0.45
    }

    if (width > 700 && width < 1200){
        height = width * 0.45
    }


    if (width < 700){
        height = width * 0.5
    }

$("#graphic-holder").css("height", height);


    projection = d3.geo.robinson()
            .center([-250, 80 ]) // -20, 20
            .scale(scalefactor)
            .translate([0,40]);

    svg = d3.select("#graphic-holder").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "svg_worldmap");

        var path = d3.geo.path()
            .projection(projection);

        var g = svg.append("g");
        console.log('hey')
        // load and display the World
        d3.json("world-110m2.json", function(error, topology) {
            g.selectAll("path")
            .data(topojson.object(topology, topology.objects.countries)
            .geometries)
            .enter()
            .append("path")
            .attr("class","country")
            .attr("d", path)
        });

 
    
    // $(".key-item-color-four").css("background-color", exportColor);  

}

function addKeyColors(){
    $(".key-item-color-one").css("background-color", produceColor);
    
    $(".key-item-color-two").css("background-color", importColor);
    
    $(".key-item-color-three").css("background-color", futureColor);
}
function adjustLayout(){

    var tempWidth = $("#wrapper").width();


    
   // $("#graphic-holder").css("height", height);



}



function addListeners(){
    $(".playButton").click( function (e){
        autoPlayData(e);
    });

    $(".buttonnav, .buttonnav-selected").click( function(e){
        upDateFilters(e);
    });


    $( "select" ).change(function (e) {
        upDateFromSelectFilters(e);
    })
    }

function addCircleListeners(){
    $(".node, .nodeB").click( function (e){
        getCountryData(e);
    });

    $("#svg_worldmap").click( function(e){
        //setYearTexts(globalYear)
    })

}

//slider code
function renderSlider(){


    timeSlider = $('#slider-range');
            $('#slider-range').noUiSlider({
                // Create two timestamps to define a range.
                    range: {
                        min: timestamp(pastYears[0]),
                        max: timestamp(pastYears[pastYears.length -1])
                    },
                    
                // Steps of one year
                    step: 365 * 24 * 60 * 60 * 1000,
                    
                // Two more timestamps indicate the handle starting positions.
                    start: [ pastYears[0] ],
                    
                // No decimals
                    format: wNumb({
                    decimals: 0
                })
            });

            $('#slider-range').on('slide', _.bind(this.readSlider, this));
            
            // var lastReportDate = this.allYears[this.allYears.length -1];
            // //$('.footnote .reportDate').html(lastReportDate)

           // this.$timeSlider = $('#slider-range');
            if(this.predefinedValue){
                 timeSlider.val(this.date);

             }else{

                 this.date = this.pastYears.length -1;
                 timeSlider.val(this.date);
            }


            // this.drawCircles(this.allYears[this.date]);
            // this.fillMapData();
            // this.showSliderInput();


}

function readSlider(){

            var timeSlider = $('#slider-range');
            var newValue = parseInt(timeSlider.val());


            if(newValue !== this.date){
                this.date = Math.round(newValue);

                var d = new Date(this.date);
                var y = d.getUTCFullYear();

                globalYear = y;

                getYearData(y);
                //this.drawCircles(this.allYears[this.date]);
                //this.fillMapData();
                //this.showSliderInput();
            }
 }



function showSliderInput(){
            var totalAmounts = 0;

            var months = ["January", "February","March","April","May","June","July","August","September","October","November","December"];
            
            _.each(this.countriesByDay,function(i,j){
            
            var currentCountryNumber = i[this.allYears[this.date]][this.toggle];
                totalAmounts+=currentCountryNumber; },this);

            var currentDate = this.allYears[this.date].split('/');
            

}

function getCountryData(e){

    var currClip = $(e.currentTarget);
      
    var id = $(currClip).attr("id");
    
    var splitArr = id.split("_");
    
    var ref = splitArr[1];
    
    var countryLongStr;

    var newCountryStatsObj;
    

    _.each(focusArray, function(item){

        var cCode = item.countrycode;
        $("#circle_"+cCode).css("opacity","0.5");
        $("#circle_"+cCode+"_B").css("opacity","0.5");

        if(cCode==ref){
            countryLongStr = item.country;
            currClipA = $("#circle_"+ref);
            currClipB = $("#circle_"+ref+"_B");
        }
       

    });



    _.each(dataSetCountryKeyStats, function(obj){

        var tempArr = obj.country.split("_");

        var checkCountryCode = tempArr[0]
            if(ref == checkCountryCode)
            {
                newCountryStatsObj = obj;
            }

    })
            
    currClipA.css("opacity","0.85")

    currClipB.css("opacity","1")

    globalCircleClip = currClipA;
    globalCircleClipInner= currClipB;

    $('#countryTitle').html(countryLongStr);
    
    $('#col-2-caption').html(newCountryStatsObj.captiontxt1);
    $('#col-2-number').html(newCountryStatsObj.caption1)
    $('#col-3-caption').html(newCountryStatsObj.captiontxt2);
    $('#col-3-number').html(newCountryStatsObj.caption2)
    $('#col-4-caption').html(newCountryStatsObj.captiontxt3);
    $('#col-4-number').html(newCountryStatsObj.caption3)
         
}


function getYearArrPos (numIn){
    var numOut = 0;
    var count = 0;
    _.each(allYears, function(item){
        
        if (numIn == item){
            numOut = count;
        }
        count++;

    });
    //numOut = timestamp(allYears[count]);
    return numOut;
}

// end of slider code


// date functions
var
    weekdays = [
        "Sunday", "Monday", "Tuesday",
        "Wednesday", "Thursday", "Friday",
        "Saturday"
    ],
    months = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];


function timestamp(str){
    return new Date(str).getTime();   
}

// Append a suffix to dates.
// Example: 23 => 23rd, 1 => 1st.
function nth (d) {
  if(d>3 && d<21) return 'th';
  switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

// Create a string representation of the date.
function formatDate ( date ) {
    return weekdays[date.getDay()] + ", " +
        date.getDate() + nth(date.getDate()) + " " +
        months[date.getMonth()] + " " +
        date.getFullYear();
}

// Write a date as a pretty value.
function setDate( value ){
    $(this).html(formatDate(new Date(+value)));   
}
//end date functions


////// add circles

function addCirclesToMap(){

        // if (globalFilter=="f_future"){
        //     $(".timeline").show();
        //     addCirclesToMap();
        // }

        d3.selectAll("circle").remove();

        var circle, pointMarker;

        var nodes = d3.range(focusArray.length).map(

                function(d, i) { 
                    
                    var strokeColor, fillColor, newStrokeWidth;


                    
                    fillColor = globalFill;
                       
                    var newLat = datasetProductionConsumption[i]["lat"];
                    var newLon = datasetProductionConsumption[i]["lon"];

                        return {
                            radius: (datasetProductionConsumption[i]["c1980"]/circleScaleFactor), 
                            lat: newLat, 
                            lon: newLon, 
                            fill: fillColor,
                            stroke: globalStroke,
                            strokeW: newStrokeWidth,
                            idStr: "circle_"+focusArray[i]["countrycode"],
                            x: projection([newLon, newLat])[0], 
                            y: projection([newLon, newLat])[1] }; 
                    });
               

                
                    circle = svg.selectAll("circle")
                        .data(nodes)
                        .enter().append("svg:circle")
                        .attr("class", "node")
                        .attr("id", function(d) { return d.idStr; })
                        // .attr("r", 0)
                        .attr("r", function(d) { return (d.radius + minCircleSize); })
                        .attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; })
                        .attr("fill", globalFill)
                        .attr("stroke",globalStroke)
                        .attr("stroke-width", "1px");//color(i % 3); });

                    // circle.transition()
                    //     .duration(500)
                    //     .attr("r", function(d) { return (d.radius); })

                    pointMarker = svg.selectAll(".nodeB")
                        .data(nodes)
                        .enter().append("svg:circle")
                        .attr("class", "nodeB")
                        .attr("fill-opacity","1")
                        .attr("id", function(d) { return d.idStr +"_B"; })
                        .attr("r", minCircleSize/5)
                        .attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; })
                        .attr("stroke", "#FFFFFF")
                        .attr("stroke-width", "3px");//color(i % 3); });

                      // pointMarker.transition()
                      //    .duration(500)
                      //    .attr("r", "15px" );

        addCircleListeners();
}



function setYearTexts (y){
    var newYearTxt;

    var statsObj = {};

    var mobileHead = "<span class='notes-header'>Notes–"+globalYear+"</span><br/>";

    d3.select("#yearText").html(y);

    _.each(yearCapsArray, function(item){

        if(item.yearstr == y){
            newYearTxt = item.captionstr;

        }
     });


    _.each(dataSetGlobalKeyStats, function(item){
    if(item.year == y){
            statsObj = item;
        }
    });
    if(isMobile){
            newYearTxt = mobileHead+newYearTxt;
        }

    d3.select("#copyHolderTop").html(newYearTxt);

    d3.select("#countryTitle").html(globalStatsTitle)

    d3.select("#col-2-caption").html(statsObj.captionone);
    d3.select("#col-2-number").html(statsObj.statone);

    d3.select("#col-3-caption").html(statsObj.captiontwo);
    d3.select("#col-3-number").html(statsObj.stattwo);

    d3.select("#col-4-caption").html(statsObj.captionthree);
    d3.select("#col-4-number").html(statsObj.statthree);

     $(globalCircleClip).css("opacity","0.5");
    $(globalCircleClipInner).css("opacity","0.5");


}


function getYearData(y){


    setYearTexts (y);



        var tempArr = [];

        if (globalFilter == "f_import"){
            focusArray = datasetImportExport;
            yearCompareStr = "i"+y;
            circleScaleFactor = 1.5;
        }

        if (globalFilter == "f_export"){
            focusArray = datasetImportExport;
            yearCompareStr = "e"+y;
            circleScaleFactor = 1.5;
        }

        if (globalFilter == "f_production"){
            focusArray = datasetProductionConsumption;
            yearCompareStr = "y"+y;
            circleScaleFactor = 10;
        }

        if (globalFilter == "f_consumption"){
            focusArray = datasetProductionConsumption;
            yearCompareStr = "c"+y;
            circleScaleFactor = 10;
        }

        if (globalFilter == "f_future"){
            focusArray = dataSetFuture;            
            yearCompareStr = "c"+y;
            circleScaleFactor = 10;
        }

        _.each(focusArray, function(item){
                   
                if(item.year = y){


                        var tempObj = {};

                        var valIn = item[yearCompareStr];

                        tempObj.country = item.country;
                        tempObj.countrycode = item.countrycode;
                        tempObj.year = y;
                        tempObj.valA = valIn;
                        tempObj.yearCaption = item.yearcaption;

                        tempArr.push(tempObj);
                }

            });

        if (!isMobile){
         upDateCircles(tempArr);
        }

        if (isMobile){
         upDateGraph(tempArr);
        }
    
}

function upDateFromSelectFilters(e){
    var newSort =  e.currentTarget.value;

    handleUpdateFromFilter(newSort)

    
}

function upDateFilters(e){ 

    $('.buttonnav-selected').removeClass( "buttonnav-selected" ).addClass( "buttonnav" );


    var clipIn = e.currentTarget;
    var newSort = $(clipIn).attr("id");
   
    $(clipIn).removeClass( "buttonnav" ).addClass('buttonnav-selected');
    //button_TradeNetwork 
    // if (globalFilter=="f_future"){
    //         $(".timeline").show();
    //         addCirclesToMap();
    //     }

    handleUpdateFromFilter(newSort)

}

function handleUpdateFromFilter(newSort){


    if (newSort=="button_Production"){
        globalFilter = "f_production";
        globalFill = produceColor;
        

    }

    if (newSort=="button_Consumption"){
        globalFilter = "f_consumption";
        globalFill = consumeColor;
       

    }

    if (newSort=="button_Import"){
        globalFilter = "f_import";
        globalFill = importColor;
      

    }

    if (newSort=="button_Export"){
        globalFilter = "f_export";
        globalFill = exportColor;
        

    }

    if (newSort=="button_Trade"){
        globalFilter = "f_trade";
        globalFill = consumeColor;


    }

    if (newSort=="button_Future"){
        globalFilter = "f_future";
        globalFill = futureColor;
   }

    showFutureBarChart(newSort);

    getYearData(globalYear);

    $('.buttonnav-selected').css('background-color',globalFill);

    setNewSliderRange();

    //setNewKeyDisplay();
}

function showFutureBarChart(newSort){

        $('#bar_IDN').show();
        $('#bar_RUS').show();
        $('#bar_ZAF').show();
        $('#bar_DEU').show();
        $('#bar_GBR').show();
        $('#cap_IDN').show();
        $('#cap_RUS').show();
        $('#cap_ZAF').show();
        $('#cap_DEU').show();
        $('#cap_GBR').show();
        $('#cap_IDN_B').show();
        $('#cap_RUS_B').show();
        $('#cap_ZAF_B').show();
        $('#cap_DEU_B').show();
        $('#cap_GBR_B').show();


     if (newSort=="button_Future"){
        $('#bar_IDN').hide();
        $('#bar_RUS').hide();
        $('#bar_ZAF').hide();
        $('#bar_DEU').hide();
        $('#bar_GBR').hide();
         $('#cap_IDN').hide();
        $('#cap_RUS').hide();
        $('#cap_ZAF').hide();
        $('#cap_DEU').hide();
        $('#cap_GBR').hide();
        $('#cap_IDN_B').hide();
        $('#cap_RUS_B').hide();
        $('#cap_ZAF_B').hide();
        $('#cap_DEU_B').hide();
        $('#cap_GBR_B').hide();
    }
}


function setNewSliderRange(){
    if(globalFilter=="f_future"){
        globalYear=2015;
        $('#slider-range').noUiSlider({

                // Create two timestamps to define a range.
                    range: {
                        min: timestamp(futureYears[0]),
                        max: timestamp(futureYears[futureYears.length -1])
                    },
                    
                // Steps of one year
                    step: 1860 * 24 * 60 * 60 * 1000
                    
                // Two more timestamps indicate the handle starting positions.
                    
                    
                
                    }, true);
            }

    if(globalFilter!="f_future"){

        if(globalYear > pastYears[pastYears.length -1]) { globalYear=1980 };
        $('#slider-range').noUiSlider({
                // Create two timestamps to define a range.
                    range: {
                        min: timestamp(pastYears[0]),
                        max: timestamp(pastYears[pastYears.length -1])
                    },
                    
                // Steps of one year
                    step: 365 * 24 * 60 * 60 * 1000
                    
                // Two more timestamps indicate the handle starting positions.
                  
                    
                
            }, true);

        }
        getYearData(globalYear)

        if(globalYear==1980){
            timeSlider.val(0);
        }

        //
}

function upDateCircles(arrIn){

    var tempArr = []

    _.each(arrIn, function(item){

        var strokeColor, fillColor, newStrokeWidth;
        var newVal = (item.valA/circleScaleFactor); 
        
        if (newVal != 0){
            newVal+=minCircleSize;
        }

            fillColor = globalFill;
            strokeColor = globalStroke;
            newVal = newVal;
           
        var newClip = "#circle_"+item.countrycode;
        var newClipB = "#circle_"+item.countrycode+"_B";
        var circle = d3.select(newClip)
        
        tempArr.push(newClip);
        tempArr.push(newClipB);

        circle.transition()
            .duration(500)
            .attr("r", newVal)
            .attr("fill", fillColor);
        });

    setCirclesView(tempArr);
        
}


function upDateGraph(arrIn){

    $(".graphBarHolderInner").css("background-color", globalFill);
    
    var graphScaleFactor; 

    console.log(globalFilter)

    if (globalFilter=="f_import" || globalFilter=="f_export") {
        graphScaleFactor = 10;
    }else{
        graphScaleFactor = 10;
    }

    console.log(graphScaleFactor)

    var maxMeasureUnit = dataSetFuture[1]["c2035"];
    measureUnit = $("#graphHolder").width()/maxMeasureUnit;

    measureUnit = measureUnit/graphScaleFactor;
    

    _.each(arrIn, function(item){
        var newVal = (item.valA); 
        
        fillColor = globalFill;
        strokeColor = globalStroke;
          
        var newClip = "#bar_"+item.countrycode;
        var newCaption = "#cap_"+item.countrycode;
        var newCaptionStat = "#cap_"+item.countrycode+"_B";
        var newW = newVal * measureUnit * graphScaleFactor;

        $(newClip).css("width", newW);

        $(newCaption).html(item.country);
        $(newCaptionStat).html(item.valA);



        if ($(newCaption).width() < $(newClip).width() || $(newCaptionStat).width() < $(newClip).width()){
            $(newCaption).css("margin-left", 3)
            $(newCaptionStat).css("margin-left", 3)

            $(newCaption).css("color", "#DCDCDC")
            $(newCaptionStat).css("color", "#DCDCDC")
        }

        if ($(newCaption).width() > $(newClip).width() || $(newCaptionStat).width() > $(newClip).width()){
            $(newCaption).css("margin-left", 3+$(newClip).width())
            $(newCaptionStat).css("margin-left", 3+$(newClip).width())

            $(newCaption).css("color", "#333")
            $(newCaptionStat).css("color", globalFill)
        }
})

        
}

function setCirclesView(arrIn){

    var currClip;

    var futureClips = ["#circle_CHN", "#circle_CHN_B", "#circle_USA", "#circle_USA_B","#circle_IND","#circle_IND_B"]

    if (globalFilter =="f_future"){
    _.each(arrIn, function(item){
            $(item).css("display","none");
                
        });

        _.each(futureClips, function(checkItem){
            $(checkItem).css("display","inline");
        })

    }
   
    if (globalFilter !="f_future"){
        _.each(arrIn, function(item){
            $(item).css("display","inline");
                
        });

    }

    





}


init();