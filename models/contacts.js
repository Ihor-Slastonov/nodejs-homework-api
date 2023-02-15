const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const contactsPath = path.resolve('models/contacts.json');

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  return JSON.parse(data);
};

const getContactById = async contactId => {
  const contacts = await listContacts();
  const result = contacts.find(contact => contact.id === contactId.toString());
  if (!result) {
    return null;
  }
  return result;
};

const removeContact = async contactId => {
  const contacts = await listContacts();
  const idx = contacts.findIndex(
    contact => contact.id === contactId.toString()
  );
  if (idx === -1) {
    return null;
  }
  const [removeContact] = contacts.splice(idx, 1);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return removeContact;
};

const addContact = async body => {
  const { name, email, phone } = body;
  const newContact = {
    id: uuidv4(),
    name,
    email,
    phone,
  };
  const contacts = await listContacts();
  contacts.push(newContact);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const idx = contacts.findIndex(
    contact => contact.id === contactId.toString()
  );
  if (idx === -1) {
    return null;
  }
  contacts[idx] = { ...contacts[idx], ...body, id: contactId.toString() };
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contacts[idx];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
