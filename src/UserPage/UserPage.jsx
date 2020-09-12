import React from 'react';

import { userService } from '@/_services';
import { authenticationService } from '@/_services';
import { Role, Group } from '@/_helpers';

class UserPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: null
        };
    }

    componentDidMount() {
        userService.getAll().then(users => this.setState({ users }));
    }

    render() {
        const { users } = this.state;
        const currentUser = authenticationService.currentUserValue;
        const getKeyByValue = (object, value) => {
            for (var prop in object) { 
                if (object.hasOwnProperty(prop)) { 
                    if (object[prop] === value) 
                    return prop; 
                } 
            } 
        }

        return (
            <div>
                <h1>Users</h1>
                <p>This page can be accessed by all authenticated users with similar role.</p>
                <div>
                    All users from secure (users only) api end point:
                    {users && 
                        <ul>
                            {users.map(user =>
                                (user.role === Role.User && getKeyByValue(Group, currentUser.group) === user.group) &&
                                    <li key={user.id} className={user.id === currentUser.id ? "font-weight-bold" : ""}>
                                        {user.firstName} {user.lastName}
                                    </li>
                            )}
                        </ul>
                    }
                </div>
            </div>
        );
    }
}

export { UserPage };