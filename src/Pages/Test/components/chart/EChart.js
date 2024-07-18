import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Typography, Select } from "antd";
import axiosInstance from "../../../../Middleware/axiosInstance";
import eChart from "./configs/eChart";

const { Title } = Typography;
const { Option } = Select;

const EChart = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [years, setYears] = useState([]);
  const [chartData, setChartData] = useState({ series: [], options: eChart.options });

  useEffect(() => {
    // Fetch years for the select dropdown
    axiosInstance.get("/api/dashboard/years")
      .then((response) => {
        const fetchedYears = response.data;
        setYears(fetchedYears);
        
        // Set the default selected year to the first year in the list
        if (fetchedYears.length > 0) {
          setSelectedYear(fetchedYears[0].ID_AnneeScolaire);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the years!", error);
      });
  }, []);

  useEffect(() => {
    if (selectedYear) {
      axiosInstance.get(`/api/dashboard/etudparfil/${selectedYear}`)
        .then((response) => {
          const data = response.data;
  
          // Prepare chart data
          const categories = data.map((item) => item.NomFiliere);
          const seriesData = data.map((item) => item.NombreEtudiants); // Use NombreEtudiants
  
          setChartData({
            series: [{
              name: "NombreEtudiant", // You can adjust this as per your requirement
              data: seriesData,
              color: "#fff",
            }],
            options: {
              ...eChart.options,
              xaxis: {
                ...eChart.options.xaxis,
                categories: categories,
                
              },
            },
          });
        })
        .catch((error) => {
          console.error("Error fetching data for selected year:", error);
        });
    }
  }, [selectedYear]);
  

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  return (
    <>
      <div id="chart">
        <Title strong level={5}>Nombre Etudiant par Filiere</Title>
        <Select
          style={{ width: 200, marginBottom: 16 }}
          placeholder="Select annee scolaire"
          onChange={handleYearChange}
          value={selectedYear} // Set the value of Select to selectedYear
        >
          {years.map((year) => (
            <Option key={year.ID_AnneeScolaire} value={year.ID_AnneeScolaire}>
              {year.AnneeScolaire}
            </Option>
          ))}
        </Select>
        {chartData.options && (
          <ReactApexChart
            className="bar-chart"
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={300}
          />
        )}
      </div>
    </>
  );
};

export default EChart;
