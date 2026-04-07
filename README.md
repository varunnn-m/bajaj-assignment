# BLE Device Manager

Production-oriented React Native assignment app for onboarding IoT devices over Bluetooth Low Energy.

## What the app does

- Scans BLE peripherals and filters them by service UUID prefix
- Sorts devices by RSSI and shows signal strength live
- Connects and pairs to a selected device
- Persists paired devices locally with `zustand` + `react-native-mmkv`
- Registers and deregisters devices against a mock cloud API
- Queues sync operations offline and replays them on reconnect, retry, or restart
- Shows per-device sync status: `synced`, `pending`, `failed`

## Stack

- React Native CLI
- TypeScript
- `react-native-ble-plx`
- Zustand
- MMKV
- `@react-native-community/netinfo`

## Folder structure

```txt
components/
hooks/
screens/
services/
  api/
  ble/
  storage/
store/
types/
utils/
```

## Setup

1. Install JavaScript dependencies:

```sh
npm install
```

2. Install Ruby gems:

```sh
bundle install
```

3. Install iOS pods:

```sh
cd ios
bundle exec pod install
cd ..
```

4. Start Metro:

```sh
npm start
```

5. Run the app:

```sh
npm run android
```

```sh
npm run ios
```

## BLE behavior

- The scan layer filters advertisements by `TARGET_SERVICE_UUID_PREFIX` in `utils/constants.ts`.
- Scan results are updated in a single BLE store and rendered by RSSI descending.
- On Android the app requests `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, and `ACCESS_FINE_LOCATION`.
- On iOS the first BLE access triggers the platform prompt; denied access routes the user to Settings.
- Connected devices are monitored for unexpected disconnects and marked disconnected without crashing the app.

## Cloud sync and offline queue

- `services/api/mockDeviceApi.ts` simulates async cloud registration and deregistration.
- Requests use random delay and random failures to exercise retry behavior.
- Failed `REGISTER` and `DEREGISTER` operations are added to a persistent queue.
- The queue is replayed in order and retried with backoff when the app is online.
- `REGISTER` failures update the paired device sync badge to `pending` or `failed`.

## Architecture notes

- `bleStore` is the single source of truth for scan and Bluetooth state.
- `deviceStore` owns paired device data and sync badges.
- `syncStore` owns the durable mutation queue and connectivity state.
- Hooks orchestrate behavior:
  - `useBLE` handles scan, pair, unpair, lifecycle, and BLE error state
  - `usePermissions` centralizes runtime permission flows and settings deep-links
  - `useSyncQueue` replays queued cloud mutations on restart and reconnect
- UI components are presentational and do not contain business logic.

## Tests

Run:

```sh
npm test -- --runInBand
```

Included coverage focuses on:

- queue creation, retries, and ordering
- paired-device state updates

## Assumptions

- The BLE peripherals advertise at least one service UUID matching the configured prefix.
- Bonding and passkey exchange are handled by the system Bluetooth stack where required.
- Unpairing removes the device locally immediately; if cloud deregistration fails, the app queues the deletion and surfaces that state via message rather than restoring the local record.
- Mock cloud registration is intentionally unreliable to prove queue replay logic.
