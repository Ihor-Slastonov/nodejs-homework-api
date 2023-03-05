const contactsQuery = (owner, req) => {
  const { favorite = null, name = null, email = null } = req;

  const query = { owner };

  if (favorite) {
    query.favorite = favorite;
  }
  if (name) {
    query.name = name;
  }
  if (email) {
    query.email = email;
  }
  return { owner, ...query };
};

module.exports = contactsQuery;
