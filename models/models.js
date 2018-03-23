const mongoose = require('mongoose');
// set the global Promise to Mongoose.
mongoose.Promise = global.Promise;
const connect = process.env.MONGODB_URI || "mongodb://upwork:upwork@ds117625.mlab.com:17625/telos";
mongoose.connect(connect);
const Schema = mongoose.Schema;
//const bcrypt = require('bcrypt');

//RESIDENTS
const residentSchema = new Schema({
    name: String,
    email: String,
    account: String,
    password: String,
    polls: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Polls'
        }
    ],
    surveys: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Survey'
        }
    ],
    estateName: String,
    unit: String,
    block: String,
    floor: String,
    nature: String,
    numberOfOwners: String,
    shares: String,
    hkid: Array,
    hkidImage: Array,
    signature: Array,
    chopImage: String,
    proxyAppointed: [
    { type: Schema.Types.ObjectId,
            ref: 'Meeting'}
            ], //ALL THE MEETINGS WHERE THEY APPOINT US AS THE PROXY.
    deviceToken: String,
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    registered: {type: Boolean , default: false},
});
//management user schema
const adminSchema = new Schema({
    name: String,
    email: String,
    account: String,
    password: String,
    otp: String,
    mobileNo: String,
});
//ESTATE
const estateSchema = new Schema({
    estateName: String,
    estateNameDisplay: String,
    estateNameChn: String,
    username: String,
    password: String,
    emailAddress: String,
    chairmanName: String,
    surveys: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Survey'
        }
    ],
    currentMeetings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Meeting'
        }
    ],
    pastMeetings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Meeting'
        }
    ],
    currentNotices: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Notice'
        }
    ],
    pastNotices: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Notice'
        }
    ],
    blockArray: [],
    allowed: {type: Boolean, default: false},
});
const managerSchema = new Schema({
    estateName: String,
    estateNameDisplay: String,
    estateNameChn: String,
    username: String,
    telephone: String,
    password: String,
    allowed: {type: Boolean, default: false},
    email: String,
    chairmanName: String,
    surveys: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Survey'
        }
    ],
    currentMeetings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Meeting'
        }
    ],
    pastMeetings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Meeting'
        }
    ],
    currentNotices: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Notice'
        }
    ],
    pastNotices: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Notice'
        }
    ],
    Projects: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Project'
        }
    ],    
    blockArray: [],
    created_At:{type:Date,default:new Date()},
    updated_At:{type:Date,default:new Date()}    
});

//POLL
const pollSchema = new Schema({
    projectName: String,
    projectNameChn: String,
    pollName: String,
    pollNameChn: String,
    summary: String,
    summaryChn: String,
    fileLinks: Array,
    estateName: String,
    options: Array,
    endTime: String,
    active: Boolean,
    voted: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Resident'
        }
    ],
    finalResult: String,
    results: [{choice: String, percentage: Number}],
    votingResults: [{choice: String, resident: {
        type: Schema.Types.ObjectId,
        ref: 'Resident'
    }}],
    votes: Array
});

//NOTICE
const noticeSchema = new Schema({
    title: String,
    titleChn: String,
    endTime: String,
    postDate: String,
    estate: String,
    fileLinks: Array,
    active: Boolean,
    targetAudience: [{block: String, floors: Array}],
})

//SURVEY
const surveySchema = new Schema({
    title: String,
    titleChn: String,
    effectiveTo: Date,
    postDate: {type: Date, default: new Date()},
    targetAudience: [{block: String, floors: Array}],
    estate: String
})

const questionSchema = new Schema({
    questionEn: String,
    questionChn: String,
    optionIds: [{ type: Schema.ObjectId, ref: 'Options' }],
    surveyId: { type: Schema.ObjectId, ref: 'Survey' },
    order: String,
})

const optionSchema = new Schema({
    questionId: { type: Schema.ObjectId, ref: 'Question' },
    optionNameEn: String,
    optionNameChn: String,
    optionsEn: [],
    optionsChn: []
})

const userAnswersSchema = new Schema({
    questionId: { type: Schema.ObjectId, ref: 'Question' },
    surveyId: { type: Schema.ObjectId, ref: 'Survey' },
    optionId: { type: Schema.ObjectId, ref: 'Option' },
    userId: { type: Schema.ObjectId, ref: 'User' },
})
//MEETING SCHEMA
const meetingSchema = new Schema({
    title: String,
    titleChn: String,
    meetingSummary: String,
    meetingSummaryChn: String,
    startTime: String,
    endTime: String,
    venue: String,
    fileLinks: Array,
    createdAt: { type: Date, default: new Date() },
    polls: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Poll'
        }
    ],
    active: Boolean,
    pollEndTime: String,
    pollReport: Array,
    estate:String,
    youtubelink: String,
    views: { type: String, default: 0 },
    proxyFullName: String,
})

//POST
const postSchema = new Schema({
    account: String,
    estateName: String,
    content: String,
    postTime: { type: Date, default: new Date() },
    lastCommentedTime: String,
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    postedBy:
    {
        type: Schema.Types.ObjectId,
        ref: 'Resident'
    }
    ,
    likedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Resident'
        }
    ],

    commentedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Resident'
        }

    ]
})

//COMMENT
const commentSchema = new Schema({
    account: String,
    content: String,
    estateName: String,
    commentedTime: String,
    commentedBy:
    {
        type: Schema.Types.ObjectId,
        ref: 'Resident'
    }
    ,
    likedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Resident'
        }
    ]
})

//POST REPORT
const postReport = new Schema({
    postReport: String,
    reportedPost : {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Resident'
    }
})

//COMMENT REPORT
const commentReport = new Schema({
    commentReport: String,
    reportedComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Resident'
    }
})

const supplierSchema = new Schema({
    chineseName: String,
    englishName: String,
    foundedIn: String,
    address: {},
    fax: String,
    tel: String,
    category: Array,
    subcategory: Array,
    website: String,
    contactPerson: String,
    description: String,
});

const contractorSchema = new Schema({
    "firstName": String,
    "lastName": String,
    "email": String,
    "password": String,
    "companyName": String,
    "companyAddress": String,
    "businessRegistrationNumber": String,
    "allowed": {type: Boolean, default: false},
    "companyTelephoneNumber": String,
    "website": String,
    "companyEmail": String,
    "servicesDescription": String,
    "awardAndLicencesPdf": Array,
    "awardAndLicencesImage": Array,
    "licenses": [],
    "profilePic":Array,
    "trackRecord":Array,
    "awards": Array,
    "created_At":{type:Date,default:new Date()},
    "updated_At":{type:Date,default:new Date()}        
});
const Resident = mongoose.model('Resident', residentSchema);
const Admin = mongoose.model('Admins', adminSchema);
const Estate =   mongoose.model('Estate', estateSchema);
const Poll = mongoose.model('Poll', pollSchema);
const Notice = mongoose.model('Notice', noticeSchema);
const Survey = mongoose.model('Survey', surveySchema);
const UserAnswers = mongoose.model('UserAnswers', userAnswersSchema)
const Options = mongoose.model('Options', optionSchema);
const Question = mongoose.model('Question', questionSchema);
const Meeting = mongoose.model('Meeting', meetingSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Post = mongoose.model('Post', postSchema);
const PostReport = mongoose.model('PostReport', postReport);
const CommentReport = mongoose.model('CommentReport',commentReport);
const Supplier = mongoose.model('Supplier', supplierSchema);
const Contractor = mongoose.model('Contractor', contractorSchema);
const Manager = mongoose.model('Manager', managerSchema);
module.exports = {
    Resident,
    Estate,
    Poll,
    Notice,
    Survey,
    Question,
    UserAnswers,
    Options,
    Meeting,
    Comment,
    Post,
    PostReport,
    Admin,
    Supplier,
    CommentReport,
    Contractor,
    Manager
}
