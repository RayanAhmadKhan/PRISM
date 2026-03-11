import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const loginUser = (payload) => {
    dispatch(login(payload));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return { ...auth, loginUser, logoutUser };
}

