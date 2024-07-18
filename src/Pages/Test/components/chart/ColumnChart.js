import React from "react";
import ReactApexChart from "react-apexcharts";
import { Typography } from "antd";
import { MinusOutlined } from "@ant-design/icons";
import columnChart from "./configs/columnChart"; // Adjusted import name

const { Title, Paragraph } = Typography;

function ColumnChart() {
  return (
    <>
      <div className="linechart">
        <div>
          <Title level={5}>Active Users</Title>
          <Paragraph className="lastweek">
            than last week <span className="bnb2">+30%</span>
          </Paragraph>
        </div>
        <div className="sales">
          <ul>
            <li>{<MinusOutlined />} Traffic</li>
            <li>{<MinusOutlined />} Sales</li>
          </ul>
        </div>
      </div>

      <ReactApexChart
        options={columnChart.options} // Adjusted to use columnChartConfig
        series={columnChart.series} // Adjusted to use columnChartConfig
        type="bar"
        height={350}
        width={"100%"}
      />
    </>
  );
}

export default ColumnChart;
