const bcrypt = require('bcryptjs');
const password = 'NewLIFE20208(';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
