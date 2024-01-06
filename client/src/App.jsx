import { useState } from "react";
import "./App.css";
import BarChart from "./components/BarChart";
import PieChart from "./components/PieChart";

function App() {
  const variables = [
    "intensity",
    "likelihood",
    "relevance",
    "start_year",
    "end_year",
    "country",
    "topic",
    "region",
    "sector",
    "pestle",
    "source",
  ];

  const filters = [
    "start_year",
    "end_year",
    "country",
    "topic",
    "region",
    "sector",
    "pestle",
  ];

  const [selectedVariable, setSelectedVariable] = useState("intensity");
  const [selectedFilter, setSelectedFilter] = useState("country");

  const handleVariableChange = (event) => {
    setSelectedVariable(event.target.value);
  };

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
  };

  return (
    <div className="App">
      {/* VARIABLES */}
      <div className="sideBar">
        <h1>Variables</h1>
        {variables.map((variable) => (
          <label key={variable}>
            <input
              type="radio"
              name="variable_radio"
              value={variable}
              checked={selectedVariable === variable}
              onChange={handleVariableChange}
            />
            {variable.toUpperCase()}
          </label>
        ))}
      </div>

      {/* FILTERS */}
      <div className="main">
        {["intensity", "likelihood", "relevance"].includes(
          selectedVariable
        ) && <h1>Filters</h1>}
        {["intensity", "likelihood", "relevance"].includes(selectedVariable) &&
          filters.map((filter) => (
            <label key={filter}>
              <input
                type="radio"
                name="filter_radio"
                value={filter}
                checked={selectedFilter === filter}
                onChange={handleFilterChange}
              />
              {filter.toUpperCase()}
            </label>
          ))}

        {/* CONDITIONAL RENDERING */}
        {["intensity", "likelihood", "relevance"].includes(selectedVariable) ? (
          <div className="inner">
            <h1>
              {selectedVariable.toUpperCase()} for{" "}
              {selectedFilter.toUpperCase()}
            </h1>
            <BarChart xAxis={selectedFilter} yAxis={selectedVariable} />
          </div>
        ) : (
          <div className="inner">
            <h1>{selectedVariable.toUpperCase()}</h1>

            <PieChart primaryProp={selectedVariable} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
