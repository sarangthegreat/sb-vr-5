const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    totalApplicants: {
        type: Number,
        default: 0,
    },
    deadline: {
        type: Date, // Set the type to Date for the deadline
        required: true, // Make this field required if necessary
    },
    // Add other fields as necessary
});

module.exports = mongoose.model('Company', companySchema);
