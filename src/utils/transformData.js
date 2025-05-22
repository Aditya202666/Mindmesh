import { ManagerAccessLevel } from "../constant.js";

const transformUser = (user) => {
    return {
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
        workspaces: user.workspaces,
        personalTasks: user.personalTasks,
        invitations: user.invitations,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

const transformWorkspace = (workspace, accessLevel) => {
    return {
        name: workspace.name,
        description: workspace.description,
        idToken: workspace.idToken,
        members: workspace.members,
        notices: workspace.notices,
        projects: workspace.projects,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        ...(accessLevel > ManagerAccessLevel && {
            invitations: workspace.invitations,
            joinRequests: workspace.joinRequests,
        }),
    };
};

export { transformUser, transformWorkspace };
