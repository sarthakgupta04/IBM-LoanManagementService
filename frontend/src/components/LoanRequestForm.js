import React, { useState } from 'react';
import axios from 'axios';
import './LoanRequestForm.css';

const LoanRequestForm = () => {
  const [principle, setPrinciple] = useState('');
  const [months, setMonths] = useState('');
  const [repaymentAmount, setRepaymentAmount] = useState(null);
  const [error, setError] = useState('');

  const calculateRepayment = (principle, monthsToRepay) => {
    const principleAmount = parseFloat(principle);
    const months = parseInt(monthsToRepay, 10);
    const interestRate = principleAmount >= 100000 ? 0.04 : principleAmount >= 50000 ? 0.03 : 0.02;
    const applicationFee = 500;
    const interestPerMonth = (principleAmount / 100) * (interestRate * 100); // Adjust interest rate to percentage
    const totalInterest = interestPerMonth * months;
    return principleAmount + totalInterest + applicationFee;
  };

  const handleCalculate = () => {
    if (!principle || !months || principle < 10000) {
      setError('Please enter valid amounts. Principle must be at least 10000.');
      return;
    }
    setError('');
    const repayment = calculateRepayment(principle, months);
    setRepaymentAmount(repayment);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!principle || !months || principle < 10000) {
      setError('Please enter valid amounts. Principle must be at least 10000.');
      return;
    }
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login again.');
        return;
      }

      const response = await axios.post(
        'http://localhost:8000/loan/newLoan', 
        { principle, monthsToRepay: months },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      alert('Loan request submitted successfully!');
    } catch (err) {
      console.error('Loan request error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error submitting loan request.');
      }
    }
  };

  return (
    <div className="loan-request-form">
      <h2>Request Loan</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Principle Amount:</label>
          <input
            type="number"
            value={principle}
            onChange={(e) => setPrinciple(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Months to Repay:</label>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="button" onClick={handleCalculate}>Calculate Repayment</button>
        <button type="submit">Request Loan</button>
      </form>
      {repaymentAmount && (
        <div className="loan-summary">
          <h3>Loan Repayment Summary</h3>
          <p>Total Repayment Amount: ${repaymentAmount.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default LoanRequestForm;
