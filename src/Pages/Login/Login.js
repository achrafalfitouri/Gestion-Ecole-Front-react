import React, { useContext } from 'react';
import { Form, Input, Button, message,Row,Col,Card,Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axiosInstance from '../../Middleware/axiosInstance';
import { UserContext } from '../../UserContextData/UserContext';
import { Navigate } from "react-router-dom";
import { useState } from "react";



const { Item } = Form;

const Login = () => {
  const { setUser } = useContext(UserContext);
  const [navigate, setNavigate] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', values);
      localStorage.setItem('token', response.data.token);
      message.success('Login successful!');
      
      const userResponse = await axiosInstance.get('/api/auth/me');
      setUser(userResponse.data);

      setNavigate(true);// Redirect to home or dashboard
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    }
  };

  if (navigate) {
    return <Navigate to="/" />;
  }
  return (
    <Row justify="center" align="middle" style={{ height: '100vh' }}>
      <Col xs={{ span: 6, offset: 0 }}>
        <div className="dark-theme-container" style={{ marginTop: '-100px' }}>
          <Card title="Bonjour , Veuillez faire la conexion" className="form-card">
            <Form form={form} onFinish={onFinish}>
              <Item
                name="Email"
                rules={[
                  {
                    required: true,
                    message: 'Veuillez saisir votre email!',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
              </Item>

              <Item
                name="MotDePasse"
                rules={[
                  {
                    required: true,
                    message: 'Veuillez saisir votre mot de passe!',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Mot de passe "
                />
              </Item>

              <Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Enregistrer </Checkbox>
                </Form.Item>
              </Item>

              <Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  conexion
                </Button>
              </Item>
            </Form>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
