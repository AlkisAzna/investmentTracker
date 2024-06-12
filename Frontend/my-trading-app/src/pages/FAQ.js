import React from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails, Container } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Navbar from '../components/Navbar';

const faqs = [
  {
    question: 'What is stock trading?',
    answer: 'Stock trading is the buying and selling of company shares or derivatives on a financial market. Traders aim to profit from short-term price fluctuations.'
  },
  {
    question: 'How does cryptocurrency trading work?',
    answer: 'Cryptocurrency trading involves exchanging digital currencies on platforms called cryptocurrency exchanges. Like stock trading, it aims to profit from price changes.'
  },
  {
    question: 'What is a blockchain?',
    answer: 'Blockchain is a distributed ledger technology that records transactions across many computers in a way that ensures security and transparency.'
  },
  {
    question: 'How do I start trading?',
    answer: 'To start trading, you need to open a brokerage account, deposit funds, and then select and purchase assets through the platform’s interface.'
  },
  {
    question: 'What are the risks of trading?',
    answer: 'Trading risks include market risk, liquidity risk, and leverage risk. It’s important to understand these risks and manage them appropriately.'
  },
  {
    question: 'What is a trading strategy?',
    answer: 'A trading strategy is a fixed plan designed to achieve a profitable return by going long or short in markets. Strategies depend on technical or fundamental analysis.'
  },
  {
    question: 'How do I choose what to trade?',
    answer: 'Choosing what to trade involves researching and analyzing different markets and assets, considering volatility, liquidity, and your own risk tolerance.'
  },
  {
    question: 'What is leverage in trading?',
    answer: 'Leverage in trading allows you to control a larger position than the amount of money deposited, increasing potential profits but also potential losses.'
  },
  {
    question: 'Can I trade with a small amount of money?',
    answer: 'Yes, many platforms allow trading with a small amount of money, and some offer fractional shares or cryptocurrencies, making it accessible to start with little capital.'
  },
  {
    question: 'How do I manage trading risks?',
    answer: 'Risk management in trading involves setting stop-loss orders, diversifying your portfolio, and not investing more than you can afford to lose.'
  }
];

const FAQ = () => {
  return (
    <>
      <Navbar position="static" />
      <Container maxWidth="lg" sx={{width: '85%', padding: '50px', borderRadius: '40px', boxShadow: '6px 4px 18px 8px rgba(0,0,0,0.3)', mt: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Raleway' }}>
          Frequently Asked Questions (FAQ)
        </Typography>
        {faqs.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}a-content`}
              id={`panel${index}a-header`}
              sx={{padding: '10px'}}
            >
              <Typography sx={{ fontFamily: 'Raleway', fontWeight: 'bold' }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ fontFamily: 'Raleway' }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </>
  );
};

export default FAQ;
