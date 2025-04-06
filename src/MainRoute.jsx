import React from 'react'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from './Dashboard/Dashboard';
import Layout from './Layout';
import ItemList from './Item/ItemList';
import BillList from './Bill/BillList';
import BillReport from './Bill/BillReport/BillReport';

import Login from './Login/Login';
import Register from './Login/Register';
import AdminRegister from './Login/adminRegister';


const MainRoute = () => {
  return (
    <Router>
      <Routes>

        <Route index element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/adminregister" element={<AdminRegister/>}/>

        { <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/itemList" element={<ItemList />} />
          <Route path="/billList" element={<BillList />} />
          <Route path="/billReport" element={<BillReport />} />

        </Route>}
      </Routes>
    </Router>
  )
}
export default MainRoute;