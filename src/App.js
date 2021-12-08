import React, { useState } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { listUsers } from './graphql/queries'

import { withAuthenticator } from '@aws-amplify/ui-react'

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px', margin: '10px' }
};

const App = () => {
  const [gUsers, setGUsers] = useState([]);
  const [lUsers, setLUsers] = useState([]);
  const [userStatus, setUserStatus] = useState('Not Created');
  const [fetchStatus, setFetchStatus] = useState('Not Fetched');

  const fetchUsers = async () => {
    setGUsers([]);
    setLUsers([]);
    const gUserData = await API.graphql(graphqlOperation(listUsers))
    setGUsers(gUserData.data.listUsers);

    const lUserData = await API.get('usertest', '/users')
    setLUsers(lUserData);

    setFetchStatus('Fetched');
  }

  const createUser = async () => {
    const response = await API.post('usertest', '/users')
    console.debug('MOO', response);
    setUserStatus('Created');
  }

  return (
    <div style={styles.container} >
      <h2>Amplify Lambda Field Test</h2>
      <button style={styles.button} onClick={createUser}>Create User</button>
      <button style={styles.button} onClick={fetchUsers}>Fetch User</button>
      <div>
        <h2>User Status: {userStatus}</h2>
        <h2>Fetch Status: {fetchStatus}</h2>
        <h3>Users (via GraphQL)</h3>
        <pre>
          <code>
            {JSON.stringify(gUsers, null, 2)}
          </code>
        </pre>

        <h3>Users (via Lambda)</h3>
        <pre>
          <code>
            {JSON.stringify(lUsers, null, 2)}
          </code>
        </pre>
      </div>
    </div>
  )
}


export default withAuthenticator(App);
