var sample_url = "/names";

// Function to add the dropdown samples list

function dropdown() {
  var url = '/names';
  Plotly.d3.json(url, function(error, response) {
    if (error) return console.warn(error);
      for (var i = 0; i < response.length; i++) {
          var dropdownMenu = d3.select('#selDataSet')
            .append('option')
            .attr('value', response[i])
            .text(response[i])          
      }
  });
}

dropdown()

// create pie chart for data

function pieChart(sample){
  var values = [];
  var labels = [];
  var names = [];
  url = "/samples/".concat(sample);
  Plotly.d3.json(url, function(error, response) {
    if (error) return console.warn(error);
    for (var i = 0; i < 10; i++){
      console.log(response)
      values.push(+response.sample_values[i]);
      labels.push(+response.otu_ids[i]);
    };
    Plotly.d3.json('/otu', function(error, response) {
        if (error) return console.warn(error);
        for (var j = 0; j < 10; j++){
          names.push(response[labels[j]]);
        }
        data = [{values, labels, hovertext:names, type:'pie'}];
        var layout = { height: 400, width:400, title:'<b>Top 10 Residents of Belly Button</b>'};
        Plotly.newPlot("pie", data, layout);
      })
  })
};

// create the bubble chart

function bubbleChart(sample){
  var all_values = [];
  var all_ids = [];
  var names = [];
  url = "/samples/".concat(sample);
  Plotly.d3.json(url, function(error, response) {
    if (error) return console.warn(error);
    
    for (i = 0; i < 30; i++){
      all_ids.push(response[0].otu_ids[i]);
    }
    Plotly.d3.json('/otu', function(error, response) {
      if (error) return console.warn(error);
      for (var j = 0; j < 30; j++){
        names.push(response[all_ids[j]]);
      }
      var bubble_trace = {
          x: all_ids,
          y: all_values,
          hovertext: names,
          mode: 'markers',
          marker: {
              size: all_values
          }
      };
      var bubble_data = [bubble_trace];
      var bubble_layout = {
          title: '<b>Bubble Chart</b><br>Top 30 samples',
          height: 500,
          width: 1000
      };
      Plotly.newPlot("bubble", bubble_data, bubble_layout);   
    })
  })
};

// populates sample metadata on the page

function populateMetaData(sample){
  url = "/metadata/".concat(sample);
  Plotly.d3.json(url, function(error, response) {
      if (error) return console.warn(error);
      var age = response.AGE;
      var bbtype = response.BBTYPE;
      var gender = response.GENDER;
      var ethnicity = response.ETHNICITY;
      var location = response.LOCATION;
      var sampleid = sample;
      document.getElementById("metadata1").innerHTML = `AGE: ${age}`;
      document.getElementById("metadata2").innerHTML = `BBTYPE: ${bbtype}`;
      document.getElementById("metadata3").innerHTML = `GENDER: ${gender}`;
      document.getElementById("metadata4").innerHTML = `ETHNICITY: ${ethnicity}`;
      document.getElementById("metadata5").innerHTML = `LOCATION: ${location}`;
      document.getElementById("metadata6").innerHTML = `SAMPLEID: ${sampleid}`;
  });
}

// This will update data when user selects a new sample from the dropdown menu

function optionChanged(sample){
  populateMetaData(sample);
  pieChart(sample);
  bubbleChart(sample);
};

//set the default sample to BB_940.

dropdown();
populateMetaData('BB_940');
pieChart('BB_940');
bubbleChart('BB_940');