import { ManagerAccessLevel } from "../constant.js";

const transformUser = (user) => {
    return {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        profession: user.profession,
        profilePic: user.profilePic.url,
        isVerified: user.isVerified,
        workspaces: user.workspaces,
    };
};

const transformWorkspace = (workspace) => {
    return {
      _id: workspace._id,
      name: workspace.name,
      title: workspace.title,
      description: workspace.description,
      createdBy: workspace.createdBy,
    };
};



export { transformUser, transformWorkspace,  };
