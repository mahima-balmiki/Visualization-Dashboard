import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as d3 from "d3";

const PieChart = ({ primaryProp }) => {
  const [jsondata, setJsondata] = useState();
  const chartRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    // Fetch data from the Python server
    axios
      .get(`http://127.0.0.1:5000/api/jsondata`)
      .then((response) => {
        setJsondata(response.data);
        console.log(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    if (!jsondata) {
      // jsondata is not available yet, return or handle accordingly
      return;
    }
    // Remove previous chart and table
    d3.select(chartRef.current).selectAll("*").remove();
    d3.select(tableRef.current).selectAll("*").remove();

    // Filter out entries with an empty string for primaryProp
    const filteredData = jsondata.filter((entry) => entry[primaryProp] !== "");

    // Extract values from filtered data based on props
    const data = d3.rollup(
      filteredData,
      (v) => v.length,
      (d) => d[primaryProp]
    );

    // Check if there is any data for the provided primaryProp
    const hasData = data.size > 0;

    const pieData = hasData
      ? Array.from(data, ([label, value]) => ({ label, value }))
      : [{ label: `Unknown ${primaryProp}`, value: 1 }];

    // Sort pieData array in descending order based on values
    pieData.sort((a, b) => b.value - a.value);

    // Set up chart dimensions
    const width = 600;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    // Create D3 selection for pie chart
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create pie chart layout
    const pie = d3.pie().value((d) => d.value);

    // Create arcs based on pie data
    const arcs = d3.arc().innerRadius(0).outerRadius(radius);

    // Add slices to the pie chart
    svg
      .selectAll("path")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("d", arcs)
      .attr("fill", (d, i) => colorScale(i))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .each(function (d, i) {
        if (i < 5) {
          // Add labels to the first 5 slices
          const centroid = arcs.centroid(d);
          svg
            .append("text")
            .attr("x", centroid[0])
            .attr("y", centroid[1])
            .attr("dy", "0.35em")
            .text(d.data.label)
            .style("text-anchor", "middle")
            .style("font-size", "12px");
        }
      });

    // Create a table for distribution data
    const table = d3.select(tableRef.current).append("table");

    // Add table headers
    const headers = ["Color", primaryProp, "Value"];
    table
      .append("thead")
      .append("tr")
      .selectAll("th")
      .data(headers)
      .enter()
      .append("th")
      .text((d) => d);

    // Add table rows
    const rows = table
      .append("tbody")
      .selectAll("tr")
      .data(pieData)
      .enter()
      .append("tr");

    // Add cells to the rows
    rows
      .selectAll("td")
      .data((d) => [
        // Use inline styles for background color
        {
          color: colorScale(pieData.indexOf(d)),
          label: d.label,
          value: d.value,
        },
      ])
      .enter()
      .append("td")
      .html((d) => {
        if (d.color) {
          return `<div style="width: 20px; height: 20px; background-color: ${d.color};"></div>`;
        } else {
          return d.label;
        }
      })
      .style("color", (d) => d.color);

    rows
      .append("td")
      .html((d) => d.label)
      .style("color", (d) => colorScale(pieData.indexOf(d)));

    rows.append("td").text((d) => d.value);
  }, [jsondata, primaryProp]); // Include primaryProp in the dependency array

  return (
    <div>
      {!jsondata && <h2>Loading Data...</h2>}
      <div ref={chartRef}></div>
      <div ref={tableRef}></div>
    </div>
  );
};

export default PieChart;
