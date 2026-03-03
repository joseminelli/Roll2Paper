# 📜 Roll2Paper

**Roll2Paper** é uma ferramenta de conversão de alta fidelidade projetada para transformar ficheiros de personagens digitais (`.cah` / `.json`) em protocolos físicos (PDF) limpos e prontos para impressão. Desenvolvido com uma estética **Cyber-Interface**, o sistema foca-se na extração inteligente de dados e na automação de métricas de RPG.

---

## 🚀 Funcionalidades Core

* **Extração Universal:** Motor compatível com qualquer classe (Guerreiro, Mago, Samurai, etc.), adaptando-se dinamicamente aos dados do ficheiro.
* **Filtros Inteligentes de Nível:** O sistema oculta automaticamente habilidades e recursos que o personagem ainda não desbloqueou.
* **Identificação de Arquétipo:** Filtragem por `archetypeId` para garantir que apenas as características da subclasse escolhida apareçam no documento.
* **Status de Combate Automáticos:** Cálculo em tempo real de Percepção Passiva, Bônus de Proficiência e Iniciativa.
* **Interface Neon Dinâmica:** Quatro temas visuais (*Teal, Red, Blue, Green*) com efeitos de brilho e animações de estado.
* **Modo Compacto Protocol:** Algoritmo que mede a largura do texto em tempo real para otimizar o espaço do PDF, evitando sobreposições.

---

## 🛠️ Stack Tecnológica

* **Engine:** JavaScript (Vanilla ES6+)
* **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Visual Identity:** Whiskline Design System (Custom CSS Neon Components)

---

## 📑 Estrutura de Dados (Ficheiro .cah)

O sistema foi desenhado para processar estruturas JSON complexas, incluindo:

1. **Parsing de Strings Aninhadas:** Converte automaticamente campos como `allRequiredClasses` e `requiredRace` de string para objeto.
2. **Deduplicação Dinâmica:** Usa estruturas de dados `Set` para garantir que habilidades repetidas em ficheiros multiclasse não poluam o PDF.
3. **Sanitização de Strings:** Formata IDs internos (ex: `city_watch`) em nomes legíveis (ex: `City Watch`) e limpa instruções de criação como "Choose 1".

---

## 💻 Instalação e Uso

Como o **Roll2Paper** é um protocolo puramente front-end, não requer servidor:

1. Clone o repositório:
```bash
git clone https://github.com/teu-usuario/roll2paper.git

```


2. Abra o `index.html` em qualquer navegador moderno.
3. Carregue o seu ficheiro `.cah` e execute a sequência de exportação.

---

## 🎨 Temas Disponíveis

O sistema suporta troca de núcleo visual em tempo real:

* 🟢 **Teal (Padrão):** O clássico visual terminal de hacking.
* 🔴 **Red:** Protocolo de combate de alta intensidade.
* 🔵 **Blue:** Interface de navegação tática.
* ✳️ **Green:** Sistema de exploração orgânica.

---

## 🛡️ Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

**Desenvolvido por José Minelli | Whiskline Studio** 
