var app = require('express');
var router = app.Router();
var Involve = require('../schemas/caseinvolve');
var commonfn = require('../../common');
var Case = require('../schemas/cases');
var Draft = require('../schemas/casedraft');
var VerifyToken = require('../../VerifyToken');
let modelCallback = require('./modelCallback');


router.get("/", function (req, res, next) {
    return res.status(500).json({
        "status": "error",
        "result": "Bad request"
    });
});
router.get("/Find", VerifyToken, function (req, res, next) {

    Draft.find({ "status": "Active" }).sort({ _id: -1 }).populate('loginid', 'name email').exec().then(data => {

        return res.status(200).json(data);

    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.get("/Findbyid/:case_id", VerifyToken, function (req, res, next) {
   
    var case_id = req.params.case_id;
    var filter = { $and: [{ "case_id": case_id }] };
    Draft.findOne(filter).exec().then(data => {
        if (data != null) {
            return res.status(200).json({ stt: 1, data: data });
        } else {
            Case.findOne({ _id: case_id }).exec().then(cdata => {

                var temp = template();
                let toemail = '';
                cdata.toemaildetail.forEach(val => {
                    toemail += ' ' + val.toemail + ' ';
                });
                var mapObj = {
                    '#claimant_name': cdata.claimant_name,
                    '#case_description': cdata.case_description,
                    '#case_type': cdata.case_type,
                    '#respodent_name': cdata.respodent_name,
                    '#unique_case_id': cdata.unique_case_id,
                    '#toemail': toemail,
                    '#claim_amount': cdata.claim_amount,
                };

                var temp2 = temp.replace(/#claimant_name|#case_description|#case_type|#respodent_name|#unique_case_id|#toemail|#claim_amount/gi, function (matched) {
                    return mapObj[matched];

                });
                let url = commonfn.baseURL() + 'app/login?joincasetoken=' + cdata._id;

                temp2 = temp2 + "<br><br><br><br><p>Case Joining url </p><p> <a href='" + url + "'> " + url + " </a> </p>";
                return res.status(200).json({ stt: 0, temp: temp2 });

            }).catch(function (err) {
                return res.status(400).json(err);
            });
        }

    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.post("/Create", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        case_id: body.caseId,
        profileId: req.profile_id,
        draft: body.draft,
        counterstt : body.counterstt,
        createDate: commonfn.Todaydate()
    };
    Draft.create(jsondata, function (err, data) {
        if (!err) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/Update", VerifyToken, function (req, res, next) {


});


function template() {

    let temp = `<p>Claimant Name : #claimant_name </p>
<p><strong>Case Type : #case_type </strong>
</p>
<p>  #case_description </p>
<p> <strong> Respodent Name : #respodent_name </strong>
</p>Date Ref No : Case id: #unique_case_id
<p>By registered post and email</p>
<p>To, #toemail
</p>
<p>Dear Sir,</p>
<p>Sub: NOTICE INVOKING ARBITRATION UNDER CLAUSE OF details of the Agreement/Contract</p>
<p>Ref: (Details of the Demand Notice issued to other side)</p>

<p>That, We are a company incorporated under the provisions of the Companies Act, 1956 and having its registered
 office at , we hereby serve you with the present notice, the contents of which are as under:</p>

<p>1. details of the business of the claimant.</p>

<p>2. At the outset, we states that, mention the facts of the case, details of the agreement/contract and events 
transpired upto the date of Demand Notice.</p>

<p>3. Along with the above, also point out the relevant provisions of the agreement/contract relied upon.</p>

<p>4. In view of the above continuous denial by the #respodent_name in clearing the outstanding 
recoverable Claim amounts due and payable to us. We have issued 
a Demand Notice dated , inter alia reiterating the facts mentioned hereinabove and providing details of the Claims 
and seeking release of the total outstanding recoverable dues of all the Claims together of #claim_amount 
(Total Outstanding Amount I.e Claim Amount) due from the #respodent_name under the (Agreement/Contract) 
to be payable within a period of [ period of time allowed under the demand notice] days (Demand Notice).</p>

<p>5. However, admittedly, you have failed to respond to the said Demand Notice within the prescribed period of days.</p>

<p>6. The Total Outstanding Amount payable by the #respodent_name to us under the (Agreement/Contract) as
 on date is as under:- 
 (i) Interest at the rate of 3 % per annum on Total Outstanding Amount from the date of this notice
  upto the initiation of the arbitration proceedings. 
  (ii) an amount of Rs. 42000 towards damages suffered by Our 
  Client on account of (reasons for claiming damages). 
  (iii) Total Outstanding Amount of the Claims is Rs. 
  #claim_amount , including damages details of which are more specifically mentioned hereinabove.
  </p>

<p>7. The aforesaid acts and events therefore make it abundantly clear that the #respodent_name
 are unwilling to comply with their obligations under the (Agreement/Contract ) to indemnify ( Claimant Name) against 
 all damages incurred or suffered by us based upon, resulting from or relating to any breach of warranty, undertaking
  or any obligation of the #respodent_name as well as with respect to any amount of tax liability incurred 
  by, imposed upon, due from or payable by #respodent_name, in relation to the period upto and including 
  the Closing Date of the (Agreement/Contract), as set out hereinabove and under various communications issued in this 
  regard. Thus, #claimant_name states that disputes have arisen between the parties and further repeated 
  attempts to amicably settle the disputes regarding the non-payment of amounts due to them have been made. Therefore, 
  bearing in mind the situation as set out hereinabove, we are left with no other alternative but to invoke arbitration
  in accordance with Clause (_) of the (Agreement/Contract). The said arbitration clause is reproduced below for your
   ready reference:</p>

<p>In terms of Clause (_) of the (Agreement/Contract) reproduced above, you are, therefore, requested to participate 

in nominating the arbitrator for this dispute. We recommend you to use e-disputeresolution.com which may help us in
 mutually appointing a neutral single arbitrator or if you insist we can opt for three arbitrator method wherein you
  can appoint one arbitrator and I can appoint one arbitrator and then the both appointed arbitrator can appoint the 
  neutral third arbitrator. Please inform us of the same within a period of 30 (thirty) days from the date of receipt
   of the present notice, failing which we shall be constrained to file appropriate proceedings in this regard.</p>
<p>Yours sincerely, #claimant_name </p><p> #claimant_name </p>`;

    return temp;
}

module.exports = router;