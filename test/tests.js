const {app, resetDB, syncDB} = require('..')
const {testData} = require('./dummy')

const chai = require('chai')
const chaiHttp = require('chai-http')
const { after } = require('mocha')

chai.use(chaiHttp)
chai.should();


describe("Tests", () => {

    it("conn test", (done) => {
        chai.request(app).get('/').end((err, res) => {
            res.should.have.status(200)
            done();
        })
    })

    it("ListEntryTestOwnerHasNoEntries", (done) => {
        resetDB().then((_) => {
            chai.request(app)
            .post('/createEntry')
            .query(testData.validCreateEntryRequest_createEntryA)
            .end((_,__) => {
                chai.request(app)
                    .get('/ListEntry' + testData.listEntryRequest_ownerHasEntires)
                    .end((err,res) => {
                        res.should.have.status(200)
                        res.body.should.have.length(1)
                        done();
                    })
            })
        })
    })

    it("ListEntryTestOwnerHasEntries", (done) => {
        resetDB().then((_) => {
            chai.request(app)
            .post('/createEntry')
            .query(testData.validCreateEntryRequest_createEntryA)
            .end((_,__) => {
                chai.request(app)
                    .get('/ListEntry' + testData.listEntryRequest_ownerHasNoEntires)
                    .end((err,res) => {
                        res.should.have.status(200)
                        res.body.should.have.length(0)
                        done();
                    })
            })
        })
    })


    it("CreateValidEntry", (done) => {
        chai.request(app)
            .post('/createEntry')
            .query(testData.validCreateEntryRequest_createEntryA)
            .end((err,res) => {
                res.should.have.status(200)
                res.body.uploader_uid.should.equal('user1')
                res.body.title.should.equal('Website A')
                res.body.url.should.equal('https://classic.yarnpkg.com/en/docs/cli/add')
                res.body.description.should.equal('')
                done();
            })
    })



    it("CreateInvalidEntry_noTitle", (done) => {
        chai.request(app)
            .post('/createEntry')
            .query(testData.invalidCreateRequest_noTitle)
            .end((err,res) => {
                res.should.have.status(400)
                done();
            })
    })

    it("CreateInvalidEntry_noURL", (done) => {
        chai.request(app)
            .post('/createEntry')
            .query(testData.invalidCreateRequest_noURL)
            .end((err,res) => {
                res.should.have.status(400)
                done();
            })
    })

    it("CreateInvalidEntry_noRequestorID", (done) => {
        chai.request(app)
            .post('/createEntry')
            .query(testData.invalidRequest_noRequestorID)
            .end((err,res) => {
                res.should.have.status(400)
                done();
            })
    })


    it("ValidUpdateRequest", (done) => {
        resetDB().then((_) => {
            chai.request(app)
            .post('/createEntry')
            .query(testData.validCreateEntryRequest_createEntryA)
            .end((_,__) => {
                chai.request(app)
                    .put('/updateEntry')
                    .query(testData.validUpdateRequest)
                    .end((err,res) => {
                        res.should.have.status(200)
                        res.body.uploader_uid.should.equal('user1')
                        res.body.title.should.equal('Website A')
                        res.body.url.should.equal('https://classic.yarnpkg.com/en/docs/cli/add')
                        res.body.description.should.equal('manual for yarn add')
                        done();
                    })
            })
        })
    })


    it("InvalidUpdateRequest_noRequestorID", (done) => {
        chai.request(app)
            .put('/updateEntry')
            .query(testData.invalidRequest_noRequestorID)
            .end((err,res) => {
                res.should.have.status(400)
                done();
            })
    })

    it("InvalidUpdateRequest_noTargetEntryID", (done) => {
        chai.request(app)
            .put('/updateEntry')
            .query(testData.invalidRequest_noTargetEntryID)
            .end((err,res) => {
                res.should.have.status(400)
                done();
            })
    })

    it("InvalidUpdateRequest_nonExistentTargetEntryID", (done) => {
        chai.request(app)
            .put('/updateEntry')
            .query(testData.invalidRequest_nonExistentTargetEntryID)
            .end((err,res) => {
                res.should.have.status(404)
                done();
            })
    })

    
    it("InvalidUpdateRequest_updateOrDeleteWhenNotOwner", (done) => {
        chai.request(app)
            .put('/updateEntry')
            .query(testData.invalidRequest_updateOrDeleteWhenNotOwner)
            .end((err,res) => {
                res.should.have.status(403)
                done();
            })
    })
    
    it("ValidDeleteRequest", (done) => {
        resetDB().then((_) => {
            chai.request(app)
            .post('/createEntry')
            .query(testData.validCreateEntryRequest_createEntryA)
            .end((_,__) => {
                chai.request(app)
                    .delete('/deleteEntry')
                    .query(testData.validDeleteEntryRequest)
                    .end((err,res) => {
                        res.should.have.status(200)
                        done();
                    })
            })
        })
    })


    it("InvalidDeleteRequest_noTargetEntryID", (done) => {
        chai.request(app)
            .delete('/deleteEntry')
            .query(testData.invalidRequest_noTargetEntryID)
            .end((err,res) => {
                res.should.have.status(400)
                done();
            })
    })

    it("InvalidDeleteRequest_noRequestorID", (done) => {
        chai.request(app)
            .delete('/deleteEntry')
            .query(testData.invalidRequest_noRequestorID)
            .end((err,res) => {
                res.should.have.status(400)
                done();
            })
    })

    it("InvalidDeleteRequest_nonExistentTargetEntryID", (done) => {
        chai.request(app)
            .post('/deleteEntry')
            .query(testData.invalidRequest_nonExistentTargetEntryID)
            .end((err,res) => {
                res.should.have.status(404)
                done();
            })
    })

    it("InvalidDeleteRequest_updateOrDeleteWhenNotOwner", (done) => {
        resetDB().then((_) => {
            chai.request(app)
            .post('/createEntry')
            .query(testData.validCreateEntryRequest_createEntryA)
            .end((_,__) => {
                chai.request(app)
                    .delete('/deleteEntry')
                    .query(testData.invalidRequest_updateOrDeleteWhenNotOwner)
                    .end((err,res) => {
                        res.should.have.status(403)
                        done();
                    })
            })
        })
    })
    
})
