document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    const container = document.querySelector('.container');

    // ===================================
    // 1. FUNGSI UTAMA NAVIGASI HALAMAN
    // ===================================
    const navigate = (targetId) => {
        pages.forEach(page => {
            page.classList.remove('active');
        });

        const targetPage = document.getElementById(targetId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        container.scrollTop = 0; 
        // Menggunakan replaceState agar tidak menumpuk di history browser
        if (targetId !== 'landing-page') {
             window.history.replaceState(null, null, `#${targetId}`);
        } else {
             window.history.replaceState(null, null, ' ');
        }
        
        // Panggil reset quiz saat pindah ke halaman quiz-drag-drop
        if (targetId === 'quiz-drag-drop') {
            // Beri sedikit waktu agar transisi halaman selesai sebelum mereset
            setTimeout(resetKoloidDragDrop, 500); 
        }
    };

    // Event Listener untuk semua tombol navigasi
    document.querySelectorAll('[data-target]').forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            navigate(target);
        });
    });

    // Hashing/Deep Linking Handler
    const initialHash = window.location.hash;
    if (initialHash) {
        const targetPageId = initialHash.substring(1); 
        const targetPage = document.getElementById(targetPageId);
        
        if (targetPage && targetPage.classList.contains('page')) {
            setTimeout(() => {
                navigate(targetPageId);
            }, 50); 
        }
    } else {
        navigate('landing-page');
    }

    // ===================================
    // 2. Logika Tabel Jenis Koloid (Baris Bisa Diklik)
    // ===================================
    const koloidTableRows = document.querySelectorAll('.custom-table-koloid tbody tr');

    koloidTableRows.forEach(row => {
        row.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            
            if (url) {
                // Navigasi ke file detail HTML eksternal
                // Catatan: Pastikan file (solpadat.html, sol.html, dll) tersedia.
                window.location.href = url;
            }
        });
    });

    // ===================================
    // 3. Logika Drag and Drop Umum (Larutan/Koloid/Suspensi)
    // ===================================
    const itemsToDrag = document.querySelectorAll('#eksplorasi-awal .drag-item');
    const dropZones = document.querySelectorAll('#eksplorasi-awal .drop-zone');
    const resetAllBtn = document.querySelector('.btn-reset-all');
    const initialDragContainer = document.querySelector('#eksplorasi-awal .items-to-drag');

    // Inisialisasi posisi drag item
    itemsToDrag.forEach(item => {
        if (item.parentElement !== initialDragContainer) {
            initialDragContainer.appendChild(item);
        }
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault(); 
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedItemId = e.dataTransfer.getData('text/plain');
            const draggedItem = document.getElementById(draggedItemId);
            const correctTarget = zone.getAttribute('data-correct');
            const feedbackElement = zone.querySelector('.feedback');

            // Cek apakah zona sudah terisi
            if (zone.querySelector('.drag-item')) {
                feedbackElement.textContent = "Zona ini sudah terisi!";
                feedbackElement.style.color = '#dc3545';
                return;
            }

            if (draggedItem && draggedItem.id === correctTarget) {
                // Jawaban Benar
                zone.appendChild(draggedItem);
                draggedItem.setAttribute('draggable', 'false');
                feedbackElement.textContent = "✅ Benar!";
                feedbackElement.style.color = '#4CAF50';
            } else {
                // Jawaban Salah
                feedbackElement.textContent = "❌ Salah, coba lagi!";
                feedbackElement.style.color = '#F44336';
                setTimeout(() => {
                    initialDragContainer.appendChild(draggedItem);
                    feedbackElement.textContent = ""; 
                }, 1000); 
            }
        });
    });

    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
            itemsToDrag.forEach(item => {
                item.setAttribute('draggable', 'true');
                // Mengembalikan item ke container awal jika dia ada di drop-zone
                if (item.parentElement.classList.contains('drop-zone')) {
                    initialDragContainer.appendChild(item);
                }
            });
            document.querySelectorAll('#eksplorasi-awal .feedback').forEach(feedback => {
                feedback.textContent = "";
            });
        });
    }

    // ===================================
    // 4. Logika Drag and Drop Jenis Koloid (Quiz)
    // ===================================

    const dragItemsKoloid = document.querySelectorAll('.drag-item-koloid');
    const dropZonesKoloid = document.querySelectorAll('.drop-zone-koloid');
    const resetKoloidBtn = document.querySelector('.btn-reset-koloid');
    const initialDragContainerKoloid = document.querySelector('#drag-items-koloid');

    // FUNGSI UTAMA: MENGACAK JAWABAN
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Aksi: Acak dan Setel ulang posisi awal
    const resetKoloidDragDrop = () => {
        const itemsArray = Array.from(dragItemsKoloid);
        
        // 1. Reset item yang terjatuh kembali ke container awal
        dropZonesKoloid.forEach(zone => {
            const droppedItem = zone.querySelector('.drag-item-koloid');
            const feedback = zone.querySelector('.feedback-koloid');
            if (droppedItem) {
                initialDragContainerKoloid.appendChild(droppedItem);
            }
            feedback.textContent = "Jenis Koloid?";
            feedback.classList.remove('correct', 'wrong');
        });

        // 2. Acak urutan jawaban di container awal
        shuffleArray(itemsArray);
        itemsArray.forEach(item => {
            initialDragContainerKoloid.appendChild(item);
            item.setAttribute('draggable', 'true');
        });
    };

    // Panggil saat halaman dimuat (untuk mengacak pertama kali)
    resetKoloidDragDrop(); 

    // Event Listener untuk Reset Button
    if (resetKoloidBtn) {
        resetKoloidBtn.addEventListener('click', resetKoloidDragDrop);
    }
    
    // Drag Events
    dragItemsKoloid.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });
    });

    // Drop Events
    dropZonesKoloid.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            zone.style.backgroundColor = '#b3e0ff'; // Efek hover
        });

        zone.addEventListener('dragleave', () => {
            zone.style.backgroundColor = '#e0f2fe'; 
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.style.backgroundColor = '#e0f2fe'; 

            const draggedItemId = e.dataTransfer.getData('text/plain');
            const draggedItem = document.getElementById(draggedItemId);
            const correctTarget = zone.getAttribute('data-correct');
            const feedbackElement = zone.querySelector('.feedback-koloid');

            if (zone.querySelector('.drag-item-koloid')) {
                // Zona sudah terisi
                feedbackElement.textContent = "Sudah terisi!";
                feedbackElement.classList.add('wrong');
                setTimeout(() => {
                    feedbackElement.textContent = "Jenis Koloid?";
                    feedbackElement.classList.remove('wrong');
                }, 1000);
                return;
            }
            
            // Cek Jawaban
            if (draggedItem && draggedItem.id === correctTarget) {
                // Benar
                zone.appendChild(draggedItem);
                draggedItem.setAttribute('draggable', 'false');
                feedbackElement.textContent = "✅ Benar!";
                feedbackElement.classList.remove('wrong');
                feedbackElement.classList.add('correct');
            } else {
                // Salah
                feedbackElement.textContent = "❌ Coba Lagi!";
                feedbackElement.classList.remove('correct');
                feedbackElement.classList.add('wrong');
                
                // Kembalikan item yang salah ke container awal
                setTimeout(() => {
                    initialDragContainerKoloid.appendChild(draggedItem);
                    feedbackElement.textContent = "Jenis Koloid?";
                    feedbackElement.classList.remove('wrong');
                }, 1000); 
            }
        });
    });
});