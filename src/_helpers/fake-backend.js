import { Role, Group } from './'

export function configureFakeBackend() {
    let users = [
        { id: 1, username: 'admin', password: 'admin', firstName: 'Admin', lastName: 'User', role: Role.Admin},
        { id: 2, username: 'user', password: 'user', firstName: 'Normal', lastName: 'User', role: Role.User, group: Group.GroupA },
        { id: 3, username: 'user1', password: 'user1', firstName: 'Normal', lastName: 'User1', role: Role.User, group: Group.GroupA },
        { id: 4, username: 'user2', password: 'user2', firstName: 'Normal', lastName: 'User2', role: Role.User, group: Group.GroupA },
        { id: 5, username: 'user3', password: 'user3', firstName: 'Normal', lastName: 'User3', role: Role.User, group: Group.GroupB },
        { id: 6, username: 'user4', password: 'user4', firstName: 'Normal', lastName: 'User4', role: Role.User, group: Group.GroupB },
        { id: 7, username: 'user5', password: 'user5', firstName: 'Normal', lastName: 'User5', role: Role.User, group: Group.GroupB },
        { id: 8, username: 'user6', password: 'user6', firstName: 'Normal', lastName: 'User6', role: Role.User, group: Group.GroupC },
        { id: 9, username: 'user7', password: 'user7', firstName: 'Normal', lastName: 'User7', role: Role.User, group: Group.GroupC },
        { id: 10, username: 'user8', password: 'user8', firstName: 'Normal', lastName: 'User8', role: Role.User, group: Group.GroupC },
    ];

    let realFetch = window.fetch;
    window.fetch = function (url, opts) {
        const authHeader = opts.headers['Authorization'];
        const isLoggedIn = authHeader && authHeader.startsWith('Bearer fake-jwt-token');
        const roleString = isLoggedIn && authHeader.split('.')[1];
        const role = roleString ? Role[roleString] : null;

        return new Promise((resolve, reject) => {
            // wrap in timeout to simulate server api call
            setTimeout(() => {
                // authenticate - public
                if (url.endsWith('/users/authenticate') && opts.method === 'POST') {
                    const params = JSON.parse(opts.body);
                    const user = users.find(x => x.username === params.username && x.password === params.password);
                    if (!user) return error('Username or password is incorrect');
                    return ok({
                        id: user.id,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        group: user.group,
                        token: `fake-jwt-token.${user.role}`
                    });
                }

                // get user by id - admin or user (user can only access their own record)
                if (url.match(/\/users\/\d+$/) && opts.method === 'GET') {
                    if (!isLoggedIn) return unauthorised();

                    // get id from request url
                    let urlParts = url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);

                    // only allow normal users access to their own + user by role record
                    const currentUser = users.find(x => x.role === role);
                    if (id !== currentUser.id) {
                        if ( role !== Role.Admin && role !== Role.User ) {
                            return unauthorised();
                        }
                    }

                    const user = users.find(x => x.id === id);
                    return ok(user);
                }

                // get all users - admin only
                if (url.endsWith('/users') && opts.method === 'GET') {
                    if (role !== Role.Admin && role !== Role.User) return unauthorised();
                    return ok(users);
                }

                // pass through any requests not handled above
                realFetch(url, opts).then(response => resolve(response));

                // private helper functions

                function ok(body) {
                    resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(body)) })
                }

                function unauthorised() {
                    resolve({ status: 401, text: () => Promise.resolve(JSON.stringify({ message: 'Unauthorised' })) })
                }

                function error(message) {
                    resolve({ status: 400, text: () => Promise.resolve(JSON.stringify({ message })) })
                }
            }, 500);
        });
    }
}