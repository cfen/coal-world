var circleReduction = 10, globalStroke="#DCDCDC", globalCircleClip, globalCircleClipInner, globalFill = produceColor = "#005689", consumeColor = "#005689",  importColor = "#4bc6df", exportColor = "#4bc6df", globalStatsTitle="Global", futureColor="#767676",   minCircleSize = 30;
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
        var windowWidth = $(window).width();

        if (windowWidth < 600){
            isMobile = true;
        }

        if (windowWidth > 600){
            isMobile = false;
        }

        console.log(isMobile);

    })  

    "use strict";
    
    var key = "1qZiBAmCI6OQOE2e5Bds-uwa8sHORYUIvkWK2ky_jnyg";               
    
    var url = "http://interactive.guim.co.uk/spreadsheetdata/" + key + ".json";
    
    $.getJSON(url, handleResponse);

    globalFilter = "f_productionAndConsumption";

    adjustLayout();

};


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
    circleReduction = 10;
    if (!isMobile){
            addMap();
            addCirclesToMap();
            $("#graphHolder").css("display","none");
        }


   

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

    $(".key-item-color-one").css("background-color", produceColor);
    
    $(".key-item-color-two").css("background-color", importColor);
    
    $(".key-item-color-three").css("background-color", futureColor);
    
    // $(".key-item-color-four").css("background-color", exportColor);  

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
            
    currClipA.css("opacity","1")

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
                            radius: (datasetProductionConsumption[i]["c1980"]/circleReduction), 
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
        }

        if (globalFilter == "f_export"){
            focusArray = datasetImportExport;
            yearCompareStr = "e"+y;
        }

        if (globalFilter == "f_production"){
            focusArray = datasetProductionConsumption;
            yearCompareStr = "y"+y;
        }

        if (globalFilter == "f_consumption"){
            focusArray = datasetProductionConsumption;
            yearCompareStr = "c"+y;
        }

        if (globalFilter == "f_future"){
            focusArray = dataSetFuture;            
            yearCompareStr = "c"+y;
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

    if (newSort=="button_Production"){
        globalFilter = "f_production";
        globalFill = produceColor;
        circleReduction = 10;

    }

    if (newSort=="button_Consumption"){
        globalFilter = "f_consumption";
        globalFill = consumeColor;
        circleReduction = 10;

    }

    if (newSort=="button_Import"){
        globalFilter = "f_import";
        globalFill = importColor;
        circleReduction = 1;

    }

    if (newSort=="button_Export"){
        globalFilter = "f_export";
        globalFill = exportColor;
        circleReduction = 1;

    }

    if (newSort=="button_Trade"){
        globalFilter = "f_trade";
        globalFill = consumeColor;


    }

    if (newSort=="button_Future"){
        globalFilter = "f_future";
        globalFill = futureColor;
        circleReduction = 10;

   
      }


    getYearData(globalYear);

    $('.buttonnav-selected').css('background-color',globalFill);

    setNewSliderRange();

    //setNewKeyDisplay();

}


function setNewKeyDisplay(){
    console.log(globalFilter)

    if (globalFilter == "f_future" || globalFilter == "f_production" || globalFilter == "f_consumption"){

        $("#heatmap-key").html("<div class='key-item'>Showing megatonnes</div>");
                
    }

    if (globalFilter == "f_import" || globalFilter == "f_export" ){

        $("#heatmap-key").html("<div class='key-item'>Showing 100,000s of tonnes</div>");
                
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
        var newVal = (item.valA/circleReduction); 
        
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

    var globalUnit = "megatonnes";

    var tempArr = []

    _.each(arrIn, function(item){

        
        var newVal = (item.valA*0.25); 

        console.log(newVal)
            fillColor = globalFill;
            strokeColor = globalStroke;
            newVal = newVal;
           
        var newClip = "#bar_"+item.countrycode;

        var newCaption = "#cap_"+item.countrycode;
        
        tempArr.push(newClip);

        $(newClip).css("width",newVal)

        $(newCaption).html(item.country+" "+item.valA+globalUnit)

})


console.log(tempArr)
        
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