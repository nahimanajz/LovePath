import { Stack } from 'expo-router';

export default function RebuildLayout(): JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />;
}
