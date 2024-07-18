import React from "react";
import ReactApexChart from "react-apexcharts";
import { Typography } from "antd";

import pieChart from "./configs/pieChart"; // Adjust import as per your file structure

const { Title } = Typography;

function PieChart() {
  return (
    <div>
      <Title level={5}>Distribution of Users</Title>
      <ReactApexChart
        options={pieChart.options}
        series={pieChart.series}
        type="donut"
        height={350}
      />
    </div>
  );
}

export default PieChart;
