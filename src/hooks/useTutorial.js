import { useEffect, useCallback } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import '../styles/tutorial.css';

export function useTutorial() {
    const startTutorial = useCallback(() => {
        const intro = introJs();

        intro.setOptions({
            steps: [
                {
                    element: '.welcome-banner',
                    intro: 'Bem-vindo ao TFM! Aqui você pode acompanhar seu progresso diário.',
                    title: 'Bem-vindo!',
                },
                {
                    element: '.btn-sync',
                    intro: 'Clique aqui para sincronizar suas atividades mais recentes do Strava.',
                    title: 'Sincronizar',
                },
                {
                    element: '.btn-goal',
                    intro: 'Defina ou atualize sua meta principal aqui.',
                    title: 'Minha Meta',
                },
                {
                    element: '.btn-generate',
                    intro: 'Use nossa IA para gerar um plano de treinos personalizado para você.',
                    title: 'Gerar Plano',
                },
                {
                    element: '.stats-cards',
                    intro: 'Acompanhe o status dos seus treinos: Pendentes, Concluídos e Perdidos.',
                    title: 'Estatísticas',
                },
                {
                    element: '.tabs-container',
                    intro: 'Alterne entre seus treinos planejados e as atividades que você já realizou.',
                    title: 'Navegação',
                },
                {
                    element: '.filters-bar',
                    intro: 'Filtre seus treinos por período ou ordem de data.',
                    title: 'Filtros',
                }
            ],
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: false,
            nextLabel: 'Próximo',
            prevLabel: 'Anterior',
            doneLabel: 'Entendi',
            // dontShowAgain: true, // Desativado para debug
            // dontShowAgainLabel: 'Não mostrar novamente',
            buttonClass: 'introjs-button-custom',
        });

        console.log('🏁 useTutorial: Starting Intro.js now...');
        intro.start();
    }, []);

    return { startTutorial };
}
