import { createCompany } from '../services/vectorStore.service.js';

export const createCompanyController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Company name is required.' });

    const company = await createCompany(name);
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: error.message });
  }
};
