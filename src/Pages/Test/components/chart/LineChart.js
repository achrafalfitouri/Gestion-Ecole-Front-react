import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Typography, DatePicker, Space } from "antd";
import { MinusOutlined } from "@ant-design/icons";
import axiosInstance from "../../../../Middleware/axiosInstance";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;

function LineChart() {
  const currentYear = dayjs().year();
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        width: "100%",
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 600,
            colors: ["#8c8c8c"],
          },
        },
      },
      xaxis: {
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 600,
            colors: ["#8c8c8c"],
          },
        },
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
    },
  });

  const [year, setYear] = useState(currentYear);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start_date = dayjs(`${year}-01-01`).format('YYYY-MM-DD');
        const end_date = dayjs(`${year}-12-31`).format('YYYY-MM-DD');

        const [expenseResponse, gainResponse] = await Promise.all([
          axiosInstance.get("/api/dashboard/expence", {
            params: { start_date, end_date },
          }),
          axiosInstance.get("/api/dashboard/gain", {
            params: { start_date, end_date },
          }),
        ]);

        const expenseData = expenseResponse.data;
        const gainData = gainResponse.data;

        const months = [
          "Janvier",
          "Février",
          "Mars",
          "Avril",
          "Mai",
          "Juin",
          "Juillet",
          "Août",
          "Septembre",
          "Octobre",
          "Novembre",
          "Décembre",
        ];

        const expenseSeries = months.map((month) => {
          const monthData = expenseData.find((data) => data.Mois_Paie === month);
          return monthData ? monthData.Total_Salaire : 0;
        });

        const gainSeries = months.map((month) => {
          const monthData = gainData.find((data) => data.Mois_Paie === month);
          return monthData ? monthData.TotalRevenue : 0;
        });

        setChartData((prevState) => ({
          ...prevState,
          series: [
            {
              name: "Expenses",
              data: expenseSeries,
            },
            {
              name: "Gains",
              data: gainSeries,
            },
          ],
        }));
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [year]);

  const handleYearChange = (date) => {
    if (date && date.isValid()) {
      setYear(date.year());
    }
  };

  return (
    <>
      <div className="linechart">
        <div>
          <Title level={5}>Gain et Despense</Title>
          <Paragraph className="lastweek">
          pour les personnels et les formateurs
          </Paragraph>
        </div>
        
        <Space direction="vertical" size={12}>
          <DatePicker
            picker="year"
            defaultValue={dayjs().year(currentYear)}
            onChange={handleYearChange}
          />
          <div className="sales">
          <ul>
            <li>{<MinusOutlined />} Gain</li>
            <li>{<MinusOutlined />} Dépense</li>
          </ul>
        </div>
        </Space>
      </div>

      <ReactApexChart
        className="full-width"
        options={chartData.options}
        series={chartData.series}
        type="area"
        height={350}
        width={"100%"}
      />
    </>
  );
}

export default LineChart;
