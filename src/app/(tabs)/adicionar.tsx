import { Redirect } from 'expo-router';

/**
 * A aba central nunca renderiza: o botão dela abre a tela de novo lançamento.
 * O arquivo existe apenas para que a rota da aba seja registrada, e o redirect
 * cobre o caso de alguém chegar aqui por link direto.
 */
export default function AddTabScreen() {
  return <Redirect href="/novo" />;
}
