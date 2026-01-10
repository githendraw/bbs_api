
const roles={
        ROLE_SUPER_ADMIN: 'Super Admin',
        ROLE_ADMIN: 'Admin',
        ROLE_MODERATOR: 'Moderator',
        ROLE_AUTHENTICATED: 'Authenticated',
    
}
const permission={
    PERMISSION_VIEW_DASHBOARD_1: 'view-admin-dashboard-1',
    PERMISSION_VIEW_DASHBOARD_2: 'view-admin-dashboard-2',
    PERMISSION_VIEW_ALL_USERS: 'view-all-users',
   
    

}


rolesToArray=()=>{
    let x = [];
    for (const key in roles) {
        x.push({
            name:roles[key]
        })
    }
    return x;
}
permissionToArray=()=>{
    let x = [];
    for (const key in permission) {
        x.push({
            name:permission[key]
        })
    }
    return x;
}

module.exports={
    roles,
    permission,
    permissionToArray,
    rolesToArray
}