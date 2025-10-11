(() => {
    const STORAGE_KEY = 'peria-story-studio';

    const defaultState = {
        storyOverview: '',
        ideas: [],
        chapters: [],
        images: [],
        scratchpad: ''
    };

    const dom = {
        storyOverview: document.getElementById('storyOverview'),
        storySuggestions: document.getElementById('storySuggestions'),
        analyzeStory: document.getElementById('analyzeStory'),
        ideaForm: document.getElementById('ideaForm'),
        ideaTitle: document.getElementById('ideaTitle'),
        ideaCategory: document.getElementById('ideaCategory'),
        ideaDescription: document.getElementById('ideaDescription'),
        ideaEditIndex: document.getElementById('ideaEditIndex'),
        ideaSubmit: document.getElementById('ideaSubmit'),
        ideaList: document.getElementById('ideaList'),
        chapterForm: document.getElementById('chapterForm'),
        chapterTitle: document.getElementById('chapterTitle'),
        chapterSummary: document.getElementById('chapterSummary'),
        chapterStatus: document.getElementById('chapterStatus'),
        chapterEditIndex: document.getElementById('chapterEditIndex'),
        chapterSubmit: document.getElementById('chapterSubmit'),
        chapterList: document.getElementById('chapterList'),
        imageForm: document.getElementById('imageForm'),
        imageUrl: document.getElementById('imageUrl'),
        imageTitle: document.getElementById('imageTitle'),
        imageNotes: document.getElementById('imageNotes'),
        imageEditIndex: document.getElementById('imageEditIndex'),
        imageSubmit: document.getElementById('imageSubmit'),
        imageList: document.getElementById('imageList'),
        scratchpad: document.getElementById('scratchpad'),
        exportData: document.getElementById('exportData'),
        clearData: document.getElementById('clearData')
    };

    let state = loadState();

    function loadState() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return deepClone(defaultState);
            const parsed = JSON.parse(stored);
            return {
                ...deepClone(defaultState),
                ...parsed,
                ideas: Array.isArray(parsed?.ideas) ? parsed.ideas : [],
                chapters: Array.isArray(parsed?.chapters) ? parsed.chapters : [],
                images: Array.isArray(parsed?.images) ? parsed.images : []
            };
        } catch (error) {
            console.warn('Não foi possível carregar os dados salvos.', error);
            return deepClone(defaultState);
        }
    }

    function persistState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function formatDate(timestamp) {
        if (!timestamp) return '';
        try {
            return new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short'
            }).format(new Date(timestamp));
        } catch (error) {
            return new Date(timestamp).toLocaleString();
        }
    }

    function resetForm(form, submitButton, defaultLabel) {
        form.reset();
        form.removeAttribute('data-editing');
        submitButton.textContent = defaultLabel;
    }

    function renderIdeas() {
        dom.ideaList.innerHTML = '';
        if (!state.ideas.length) {
            dom.ideaList.innerHTML = '<li class="empty-state">Nenhuma ideia ainda. Que tal anotar a próxima faísca criativa?</li>';
            return;
        }

        state.ideas.forEach((idea, index) => {
            const li = document.createElement('li');
            li.className = 'item-card';
            li.dataset.index = index;

            const header = document.createElement('header');
            const title = document.createElement('h3');
            title.textContent = idea.title;
            header.appendChild(title);

            if (idea.category) {
                const category = document.createElement('span');
                category.className = 'tag';
                category.textContent = idea.category;
                header.appendChild(category);
            }

            li.appendChild(header);

            const description = document.createElement('p');
            description.textContent = idea.description;
            li.appendChild(description);

            const footer = document.createElement('div');
            footer.className = 'card-actions';

            const meta = document.createElement('span');
            meta.className = 'meta';
            meta.textContent = idea.updatedAt && idea.updatedAt !== idea.createdAt
                ? `Atualizada em ${formatDate(idea.updatedAt)}`
                : `Criada em ${formatDate(idea.createdAt)}`;
            footer.appendChild(meta);

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'secondary';
            editBtn.textContent = 'Editar';
            editBtn.addEventListener('click', () => startEditIdea(index));

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'ghost danger';
            deleteBtn.textContent = 'Excluir';
            deleteBtn.addEventListener('click', () => removeIdea(index));

            footer.append(editBtn, deleteBtn);
            li.appendChild(footer);

            dom.ideaList.appendChild(li);
        });
    }

    function renderChapters() {
        dom.chapterList.innerHTML = '';
        if (!state.chapters.length) {
            dom.chapterList.innerHTML = '<p class="empty-state">Planeje aqui a jornada narrativa de Péria, um capítulo por vez.</p>';
            return;
        }

        state.chapters.forEach((chapter, index) => {
            const article = document.createElement('article');
            article.className = 'item-card';
            article.dataset.index = index;

            const header = document.createElement('header');
            const title = document.createElement('h3');
            title.textContent = chapter.title;
            header.appendChild(title);

            const status = document.createElement('span');
            status.className = 'status-pill';
            status.dataset.status = chapter.status;
            status.textContent = chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1);
            header.appendChild(status);

            article.appendChild(header);

            const summary = document.createElement('p');
            summary.textContent = chapter.summary;
            article.appendChild(summary);

            const meta = document.createElement('small');
            meta.textContent = chapter.updatedAt && chapter.updatedAt !== chapter.createdAt
                ? `Atualizado em ${formatDate(chapter.updatedAt)}`
                : `Criado em ${formatDate(chapter.createdAt)}`;
            article.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'card-actions';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'secondary';
            editBtn.textContent = 'Editar';
            editBtn.addEventListener('click', () => startEditChapter(index));

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'ghost danger';
            deleteBtn.textContent = 'Excluir';
            deleteBtn.addEventListener('click', () => removeChapter(index));

            actions.append(editBtn, deleteBtn);
            article.appendChild(actions);

            dom.chapterList.appendChild(article);
        });
    }

    function renderImages() {
        dom.imageList.innerHTML = '';
        if (!state.images.length) {
            dom.imageList.innerHTML = '<p class="empty-state">Salve referências visuais para manter a estética do seu universo.</p>';
            return;
        }

        state.images.forEach((image, index) => {
            const figure = document.createElement('figure');
            figure.className = 'figure-card';
            figure.dataset.index = index;

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.title || 'Referência visual';
            img.loading = 'lazy';
            img.addEventListener('error', () => {
                img.classList.add('broken');
                img.alt = 'Não foi possível carregar esta imagem.';
            });
            figure.appendChild(img);

            const figcaption = document.createElement('figcaption');
            const title = document.createElement('strong');
            title.textContent = image.title;
            figcaption.appendChild(title);

            if (image.notes) {
                const notes = document.createElement('small');
                notes.textContent = image.notes;
                figcaption.appendChild(notes);
            }

            const meta = document.createElement('small');
            meta.textContent = image.updatedAt && image.updatedAt !== image.createdAt
                ? `Atualizada em ${formatDate(image.updatedAt)}`
                : `Adicionada em ${formatDate(image.createdAt)}`;
            figcaption.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'card-actions';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'secondary';
            editBtn.textContent = 'Editar';
            editBtn.addEventListener('click', () => startEditImage(index));

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'ghost danger';
            deleteBtn.textContent = 'Excluir';
            deleteBtn.addEventListener('click', () => removeImage(index));

            actions.append(editBtn, deleteBtn);
            figcaption.appendChild(actions);
            figure.appendChild(figcaption);

            dom.imageList.appendChild(figure);
        });
    }

    function renderStory() {
        dom.storyOverview.value = state.storyOverview;
    }

    function renderScratchpad() {
        dom.scratchpad.value = state.scratchpad;
    }

    function startEditIdea(index) {
        const idea = state.ideas[index];
        dom.ideaTitle.value = idea.title;
        dom.ideaCategory.value = idea.category || '';
        dom.ideaDescription.value = idea.description;
        dom.ideaForm.dataset.editing = index;
        dom.ideaSubmit.textContent = 'Atualizar ideia';
        dom.ideaTitle.focus();
    }

    function removeIdea(index) {
        if (!confirm('Deseja remover esta ideia?')) return;
        state.ideas.splice(index, 1);
        persistState();
        renderIdeas();
    }

    function startEditChapter(index) {
        const chapter = state.chapters[index];
        dom.chapterTitle.value = chapter.title;
        dom.chapterSummary.value = chapter.summary;
        dom.chapterStatus.value = chapter.status;
        dom.chapterForm.dataset.editing = index;
        dom.chapterSubmit.textContent = 'Atualizar cena';
        dom.chapterTitle.focus();
    }

    function removeChapter(index) {
        if (!confirm('Deseja remover esta cena/capítulo?')) return;
        state.chapters.splice(index, 1);
        persistState();
        renderChapters();
    }

    function startEditImage(index) {
        const image = state.images[index];
        dom.imageUrl.value = image.url;
        dom.imageTitle.value = image.title;
        dom.imageNotes.value = image.notes || '';
        dom.imageForm.dataset.editing = index;
        dom.imageSubmit.textContent = 'Atualizar entrada';
        dom.imageUrl.focus();
    }

    function removeImage(index) {
        if (!confirm('Deseja remover esta referência visual?')) return;
        state.images.splice(index, 1);
        persistState();
        renderImages();
    }

    function getTimestamp() {
        return new Date().toISOString();
    }

    function analyzeText(text) {
        const suggestions = [];
        const trimmed = text.trim();

        if (!trimmed) {
            return [{ type: 'info', message: 'Escreva um trecho para receber sugestões de melhoria.' }];
        }

        if (trimmed.length < 180) {
            suggestions.push({
                type: 'dica',
                message: 'Amplie o texto com mais detalhes sensoriais ou motivações para fortalecer o contexto narrativo.'
            });
        }

        if (/ {2,}/.test(trimmed)) {
            suggestions.push({
                type: 'revisão',
                message: 'Há espaços duplos consecutivos. Substitua-os por apenas um espaço para manter a fluidez.'
            });
        }

        const repeatedWords = trimmed.match(/\b(\w+)\s+\1\b/gi);
        if (repeatedWords) {
            suggestions.push({
                type: 'revisão',
                message: `Palavras repetidas detectadas: ${[...new Set(repeatedWords.map(word => word.toLowerCase()))].join(', ')}.`
            });
        }

        const sentences = trimmed.split(/(?<=[.!?])\s+/);
        const lowercaseSentences = sentences.filter(sentence => /^[a-zà-ú]/.test(sentence.trim()));
        if (lowercaseSentences.length) {
            suggestions.push({
                type: 'gramática',
                message: 'Algumas frases começam com letra minúscula; considere iniciar frases com maiúsculas para maior clareza.'
            });
        }

        const longSentences = sentences.filter(sentence => sentence.length > 220);
        if (longSentences.length) {
            suggestions.push({
                type: 'estilo',
                message: 'Há frases muito longas. Dividir em frases menores pode melhorar o ritmo da leitura.'
            });
        }

        if (!/[.!?…]$/.test(trimmed)) {
            suggestions.push({
                type: 'estrutura',
                message: 'O texto termina sem pontuação final. Finalize com ponto, exclamação ou interrogação.'
            });
        }

        if (!suggestions.length) {
            suggestions.push({
                type: 'sucesso',
                message: 'Ótimo trabalho! O texto parece consistente. Ainda assim, leia em voz alta para pegar nuances de ritmo.'
            });
        }

        return suggestions;
    }

    function renderSuggestions(items) {
        dom.storySuggestions.innerHTML = '';
        items.forEach(({ type, message }) => {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion';
            const label = document.createElement('strong');
            label.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            suggestion.appendChild(label);
            const text = document.createElement('span');
            text.textContent = message;
            suggestion.appendChild(text);
            dom.storySuggestions.appendChild(suggestion);
        });
    }

    dom.storyOverview.addEventListener('input', () => {
        state.storyOverview = dom.storyOverview.value;
        persistState();
    });

    dom.scratchpad.addEventListener('input', () => {
        state.scratchpad = dom.scratchpad.value;
        persistState();
    });

    dom.ideaForm.addEventListener('submit', event => {
        event.preventDefault();
        const now = getTimestamp();
        const payload = {
            title: dom.ideaTitle.value.trim(),
            category: dom.ideaCategory.value.trim(),
            description: dom.ideaDescription.value.trim(),
            createdAt: now,
            updatedAt: now
        };

        if (!payload.title || !payload.description) {
            alert('Preencha título e descrição para salvar a ideia.');
            return;
        }

        if (dom.ideaForm.dataset.editing) {
            const index = Number(dom.ideaForm.dataset.editing);
            payload.createdAt = state.ideas[index].createdAt;
            state.ideas[index] = payload;
        } else {
            state.ideas.unshift(payload);
        }

        persistState();
        renderIdeas();
        resetForm(dom.ideaForm, dom.ideaSubmit, 'Adicionar ideia');
    });

    dom.chapterForm.addEventListener('submit', event => {
        event.preventDefault();
        const now = getTimestamp();
        const payload = {
            title: dom.chapterTitle.value.trim(),
            summary: dom.chapterSummary.value.trim(),
            status: dom.chapterStatus.value,
            createdAt: now,
            updatedAt: now
        };

        if (!payload.title || !payload.summary) {
            alert('Preencha título e resumo para salvar o capítulo.');
            return;
        }

        if (dom.chapterForm.dataset.editing) {
            const index = Number(dom.chapterForm.dataset.editing);
            payload.createdAt = state.chapters[index].createdAt;
            state.chapters[index] = payload;
        } else {
            state.chapters.unshift(payload);
        }

        persistState();
        renderChapters();
        resetForm(dom.chapterForm, dom.chapterSubmit, 'Salvar cena');
    });

    dom.imageForm.addEventListener('submit', event => {
        event.preventDefault();
        const now = getTimestamp();
        const payload = {
            url: dom.imageUrl.value.trim(),
            title: dom.imageTitle.value.trim(),
            notes: dom.imageNotes.value.trim(),
            createdAt: now,
            updatedAt: now
        };

        if (!payload.url || !payload.title) {
            alert('Informe a URL e o título para adicionar à galeria.');
            return;
        }

        if (dom.imageForm.dataset.editing) {
            const index = Number(dom.imageForm.dataset.editing);
            payload.createdAt = state.images[index].createdAt;
            state.images[index] = payload;
        } else {
            state.images.unshift(payload);
        }

        persistState();
        renderImages();
        resetForm(dom.imageForm, dom.imageSubmit, 'Adicionar à galeria');
    });

    dom.analyzeStory.addEventListener('click', () => {
        const results = analyzeText(dom.storyOverview.value);
        renderSuggestions(results);
    });

    dom.exportData.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        anchor.href = url;
        anchor.download = `peria-atelie-backup-${timestamp}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    });

    dom.clearData.addEventListener('click', () => {
        if (!confirm('Tem certeza de que deseja apagar todos os dados salvos deste navegador?')) return;
        state = deepClone(defaultState);
        persistState();
        renderStory();
        renderScratchpad();
        renderIdeas();
        renderChapters();
        renderImages();
        dom.storySuggestions.innerHTML = '';
    });

    // Inicialização
    renderStory();
    renderScratchpad();
    renderIdeas();
    renderChapters();
    renderImages();
})();
