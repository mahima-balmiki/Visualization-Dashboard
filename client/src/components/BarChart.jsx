import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import axios from "axios";

const BarChart = ({ xAxis, yAxis }) => {
  const [jsondata, setJsondata] = useState();

  const chartRef = useRef(null);

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
    // Remove previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Extract values from JSON data based on props
    const data = jsondata
      .filter((entry) => entry[xAxis] !== "") // Exclude entries with empty strings for xAxis
      .map((entry) => ({
        xValue: entry[xAxis],
        yValue: yAxis ? entry[yAxis] : 1, // If yAxis is not provided, use 1 for count
      }));

    // If yAxis is not provided, create a rollup to count occurrences of each xValue
    const rolledUpData = yAxis
      ? data
      : Array.from(
          d3.rollup(
            data,
            (v) => d3.sum(v, (d) => d.yValue),
            (d) => d.xValue
          ),
          ([xValue, yValue]) => ({ xValue, yValue })
        );

    // Set up chart dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Calculate the width dynamically based on the container width
    const containerWidth = chartRef.current.clientWidth;
    const width = containerWidth - margin.left - margin.right;

    // Calculate the height dynamically based on the container height
    const height = 400 - margin.top - margin.bottom;

    // Create D3 selection
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", "100%") // Set width to 100%
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a scale for the x-axis (ordinal scale for discrete categories)
    const xScale = d3
      .scaleBand()
      .domain(rolledUpData.map((d) => d.xValue))
      .range([0, width])
      .padding(0.1);

    // Create a scale for the y-axis (linear scale for intensity values)
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(rolledUpData, (d) => d.yValue)])
      .range([height, 0]);

    // Create bars based on x and y values
    svg
      .selectAll("rect")
      .data(rolledUpData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.xValue))
      .attr("y", (d) => yScale(d.yValue))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.yValue))
      .attr("fill", "#69b3a2")
      .style("opacity", 0.8)
      .style("box-shadow", "2px 2px 5px #888888")
      .transition()
      .duration(800)
      .ease(d3.easeQuadOut)
      .delay((d, i) => i * 100);

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .style("font-size", "12px");

    // Add x-axis label
    svg
      .append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 10})`)
      .style("text-anchor", "middle")
      .text(xAxis);

    // Add y-axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Add y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(yAxis || "Count");
  }, [xAxis, yAxis, jsondata]);

  return (
    <>
      {!jsondata && <h2>Loading...</h2>}
      <div ref={chartRef} style={{ width: "100%" }}></div>
    </>
  );
};

export default BarChart;
