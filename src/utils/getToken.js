let memoryToken = null;

export const setToken = (token) => {
  memoryToken = token;
};

export default function getToken() {
  return memoryToken;
}
