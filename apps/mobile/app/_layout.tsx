import { Stack } from 'expo-router';
import { colors } from '../src/shared/theme/colors';

export default function Layout() { return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />; }
