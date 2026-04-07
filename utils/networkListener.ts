import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function subscribeToNetworkChanges(
  listener: (state: NetInfoState) => void,
): () => void {
  return NetInfo.addEventListener(listener);
}

export async function isNetworkReachable(): Promise<boolean> {
  const state = await NetInfo.fetch();

  if (state.isConnected === false) {
    return false;
  }

  if (state.isInternetReachable === false) {
    return false;
  }

  return true;
}
