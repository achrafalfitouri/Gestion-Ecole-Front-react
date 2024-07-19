import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Typography, DatePicker, Space } from "antd";
import { MinusOutlined } from "@ant-design/icons";
import axiosInstance from "../../../../Middleware/axiosInstance";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;

function ColumnChart() {
  const currentYear = dayjs().year();
  const [chartData, setChartData] = useState({
    series: [{
      data: []
    }],
    options: {
      chart: {
        height: 350,
        type: 'bar',
      },
      colors: ['#FF4560', '#775DD0', '#00E396', '#008FFB', '#FEB019', '#FF4560', '#775DD0', '#00E396'],
      plotOptions: {
        bar: {
          columnWidth: '45%',
          distributed: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      xaxis: {
        categories: [],
        labels: {
          style: {
            colors: ['#FF4560', '#775DD0', '#00E396', '#008FFB', '#FEB019', '#FF4560', '#775DD0', '#00E396'],
            fontSize: '12px'
          }
        }
      }
    }
  });

  const [year, setYear] = useState(currentYear);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start_date = dayjs(`${year}-01-01`).format('YYYY-MM-DD');
        const end_date = dayjs(`${year}-12-31`).format('YYYY-MM-DD');

        const response = await axiosInstance.get("/api/dashboard/expensefour", {
          params: { start_date, end_date },
        });

        const data = response.data;

        const categories = data.map(item => item.NomFournisseur);
        const seriesData = data.map(item => item.TotalMontant);

        setChartData(prevState => ({
          ...prevState,
          series: [{
            data: seriesData
          }],
          options: {
            ...prevState.options,
            xaxis: {
              ...prevState.options.xaxis,
              categories: categories
            }
          }
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
          <Title level={5}>Total Montant per Fournisseur</Title>
          <Paragraph className="lastweek">
            for the selected year
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
            <li>{<MinusOutlined />} Total Montant</li>
          </ul>
        </div>
        </Space>
      </div>

      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
        width={"100%"}
      />
    </>
  );
}

export default ColumnChart;
