            {
                $lookup: {
                    from: "idcards",
                    localField: "members",
                    foreignField: "_id",
                    as: "members",
                    pipeline: [
                        // lookup user
                        {
                            $lookup: {
                                from: "users",
                                localField: "user",
                                foreignField: "_id",
                                as: "user",
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            profileImage: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        // filter access 
                        {
                            $addFields: {
                                access:{
                                    $filter:{
                                        input: "$access",
                                        as: "item",
                                        cond: {
                                            $eq: ["$$item.token", req.workspace.idToken]
                                        }
                                    }
                                }
                            }
                        }
                    ],
                },
            },
