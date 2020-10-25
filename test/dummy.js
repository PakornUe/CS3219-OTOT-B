const testData = {
    validFullEntry_A: {
        id:1,
        uploader_uid: "user1",
        title: "Website A",
        url: "https://classic.yarnpkg.com/en/docs/cli/add",
        description: ""
    },

    invalidRequest_noRequestorID: {
        id: 1
    },
    invalidCreateRequest_noTitle: {
        requestor_uid: "user1",
        id: 1,
        url: "www.google.com"
    },
    invalidCreateRequest_noURL: {
        requestor_uid: "user1",
        id: 1,
        title: "google",
    },
    validUpdateRequest: {
        requestor_uid: "user1",
        id: 1,
        description: "manual for yarn add"
    },

    invalidRequest_noTargetEntryID: {
        requestor_uid: "user1",
        title: "google",
        url: "www.google.com"
    },

    invalidRequest_nonExistentTargetEntryID: {
        requestor_uid: "user1",
        id: 1337,
    },
    invalidRequest_updateOrDeleteWhenNotOwner: {
        requestor_uid: "impostor",
        id: 1,
    },
    validCreateEntryRequest_createEntryA: {
        requestor_uid: "user1",
        title: "Website A",
        url: "https://classic.yarnpkg.com/en/docs/cli/add"
    },

    validDeleteEntryRequest:  {
        requestor_uid: "user1",
        id: 1,
    },
    listEntryRequest_ownerHasEntires: "?requestor_uid=user1",
    listEntryRequest_ownerHasNoEntires: "?requestor_uid=user2",
}

module.exports = {
    testData
};
