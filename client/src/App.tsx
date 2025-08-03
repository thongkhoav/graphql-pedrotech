import { useQuery, useMutation, gql } from "@apollo/client";
import { useRef, useState } from "react";
const GET_USERS = gql`
  query GetUsers1 {
    getUsers {
      id
      isMarried
      name
      age
    }
  }
`;

const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      id
      isMarried
      name
      age
      email
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $age: Int!, $isMarried: Boolean!) {
    createUser(name: $name, age: $age, isMarried: $isMarried) {
      age
      isMarried
      name
    }
  }
`;
function App() {
  const {
    loading: getUsersLoading,
    error: getUsersError,
    data: getUsersData,
    refetch: refetchUsers,
  } = useQuery(GET_USERS);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_USER_BY_ID, {
    variables: { id: selectedUserId },
  });

  const [createUser, { error: createUserError }] = useMutation(CREATE_USER);
  const nameRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value;
    const age = parseInt(ageRef.current?.value || "0", 10);
    if (!name || isNaN(age)) return;
    try {
      await createUser({
        variables: {
          name,
          age,
          isMarried: false, // Default value, can be changed as needed
        },
      });
      nameRef.current!.value = "";
      ageRef.current!.value = "";
      // load users again to reflect the new user
      setSelectedUserId(null); // Reset selected user after creation
      // Optionally, you can refetch the users query here
      refetchUsers();
    } catch (error) {
      console.error({ error: createUserError });
    }
  };

  if (getUsersLoading) return <p>Loading...</p>;
  if (getUsersError) return <p>Error : {getUsersError.message}</p>;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <form onSubmit={handleCreateUser}>
        <h1>Create user</h1>
        {createUserError && (
          <span style={{ color: "red" }}>{createUserError?.message}</span>
        )}
        <input type="text" placeholder="Name" ref={nameRef} />
        <input type="number" placeholder="Age" ref={ageRef} />
        <button>Create user</button>
      </form>

      <h1>Selected user</h1>
      {userLoading ? (
        <p>Loading user...</p>
      ) : (
        <p style={{ border: "1px solid orange", padding: "10px" }}>
          Name: {userData ? userData.getUserById.name : "None"}
          <br />
          Age: {userData ? userData.getUserById.age : "None"}
          <br />
          Married:{" "}
          {userData ? (userData.getUserById.isMarried ? "Yes" : "No") : "None"}
          <br />
          Email: {userData ? userData.getUserById.email : "None"}
        </p>
      )}
      <div>
        {getUsersData.getUsers.map((user) => (
          <div key={user.id}>
            <h2
              onClick={() => setSelectedUserId(user.id)}
              style={{ cursor: "pointer" }}
            >
              {user.name}
            </h2>
            <p>Age: {user.age}</p>
            <p>Married: {user.isMarried ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
