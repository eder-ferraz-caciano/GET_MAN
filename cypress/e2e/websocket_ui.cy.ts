describe('AuraFetch - WebSocket UI', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.visit('/');
        // Espera a UI carregar
        cy.get('.app-title', { timeout: 30000 }).should('be.visible');
    });

    it('Deve criar uma requisição WebSocket via menu e mostrar a UI de chat', () => {
        cy.contains('.tree-item', 'Meu Servidor/Projeto').within(() => {
            cy.get('button[title="Opções"]').click({ force: true });
        });

        cy.get('.tree-dropdown-menu').contains('Nova Conexão WS').click();
        
        // Verifica se a tag WS aparece na árvore
        cy.get('.tree-item.active-node .method-WS').should('contain', 'WS');
        cy.get('.tree-item.active-node .node-name').should('contain', 'Conexão WebSocket');

        // Verifica a URL bar
        cy.get('.url-bar-container').should('contain', 'WS');
        cy.get('input[placeholder="wss://echo.websocket.org..."]').should('have.value', 'wss://echo.websocket.org');

        // Verifica o botão de conectar
        cy.get('.btn-send').should('contain', 'Conectar WS');

        // Verifica o painel de chat / input de mensagem
        cy.get('textarea[placeholder="Escreva a mensagem (Enter para enviar)..."]').should('be.visible');
        
        // Tenta digitar algo e o botão enviar inicialmente deve estar desabilitado (pois não está conectado)
        cy.get('textarea').type('Olá WebSocket', { force: true });
        cy.get('button').find('svg.lucide-send').parent().should('be.disabled');
    });
});
