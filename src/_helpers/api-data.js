import React, { Component } from 'react'

class ApiData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            isLoaded: false,
        }
    }

    componentDidMount() {

        fetch('https://randomuser.me/api/?inc=id,name,gender,admin,login')
            .then(res => res.json())
            .then(json => {
                this.setState({
                    users: json,
                    isLoaded: true,
                });
            })

    }

    render() {
        let {users, isLoaded} = this.state;
        
        if (!isLoaded) {
            return <div>Loading...</div>
        } else {
            return (
                <div>
                    <ul>
                        {
                            users.map( user => {
                                <li key={user.id}>{user.name.first}</li>
                            })
                        }
                    </ul>
                </div>
            )
        }
    }
}

export default ApiData;