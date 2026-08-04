import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { env, isProduction } from '@/config/env';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Troqito</Text>
        <Text style={styles.subtitle}>
          Finanças pessoais, familiares e domésticas
        </Text>
        {!isProduction && (
          <Text style={styles.stage} accessibilityRole="text">
            Estágio: {env.stage}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B6B3A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#C8E9D6',
  },
  stage: {
    marginTop: 16,
    fontSize: 13,
    color: '#8FD0AC',
  },
});
