# insurance-claim-demo
Das demo Projekt implementiert ein beispielhaftes Prozess zur verarbeitung eines Versicherungsanspruchs. Der Prozess ist durch das folgende BPMN Diagramm beschrieben:

![insurance claim process BPMN](https://github.com/kerilz/insurance-claim-demo/blob/7437c7ed763d91b2230f6aeb61a11e4b7d513467/claim.png)

**Projektstruktur:**

- insurance-claim-demo: Embedded Camunda Engine in form von einer Spring Boot App
- risk: Risikobewertung Rest Service
- external_task_client: eine Sammlung von External Task Workers zur Bearbeitung von [Service Tasks](https://docs.camunda.org/manual/7.20/reference/bpmn20/tasks/service-task/)
- express_server: gibt eine Übersicht über alle Prozessinstanzen (einzelne Versicherungsansprüche)
- models: BPMN und DMN Modelle, HTML Forms für User Tasks

**Ablauf:**

- Der Prozess fängt an mit Einreichen von Versicherungsanspruchsdaten durch den Versicherungsnehmer. Die beispielhafte Daten findet man unter ./demoData.json.
- Die Daten werden durch einen [External Task Worker](https://docs.camunda.org/manual/7.20/user-guide/ext-client/) validiert und gespeichert
- Der Anspruch wird durch einen Mitarbeiter (implementiert als [User Task](https://docs.camunda.org/manual/7.20/reference/bpmn20/tasks/user-task/)) registriert, falls die Daten valide sind, andererfals wird ein [Error Boundary Event](https://docs.camunda.org/manual/7.20/reference/bpmn20/events/error-events/#error-boundary-event) den Prozess in andere Richtung führen. Versicherungsnehmer wird durch einen Mitarbeiter für Unterstützung kontaktiert. In beiden Fällen bekommt der Versicherungsnehmer entsprechende Nachricht, die auch vom External Task Worker verschickt wird.
- Parallel zum Verschicken der Nachricht über Erfolgreiche Registrierung des Anspruchs wird das Risiko (Dubiosität) des Anspruchs geschätzt. External Task Worker schickt eine Anfrage ans Risikobewertungservice.
- Ein Mitarbeiter lädt Dokumente hoch.
- Dokumente werden validiert (nur PFD ist akzeptiert), falls eine nicht-PDF Datei hochgeladen wurde, geht der Prozess zurück zum letzten Schritt.
- Durch das folgende [DMN](https://en.wikipedia.org/wiki/Decision_Model_and_Notation) Modell wird entschieden ob Automatische Genehmigung des Anspruchs <br>
![claim DMN](https://github.com/kerilz/insurance-claim-demo/blob/7437c7ed763d91b2230f6aeb61a11e4b7d513467/dmn.png)
- Falls Automatische Genehmigung möglich ist, wird gleich eine Bezahlung an den Versicherungsnehmer initiiert (implementiert durch [Java Delegate](https://docs.camunda.org/manual/7.20/user-guide/process-engine/delegation-code/#java-delegate))
- Falls keine Automatische Genehmigung möglich ist, wird der Anspruch manuell durch einen Mitarbeiter Genehmigt oder Abgelehnt
- In beiden Fällen wird an den Versicherungsnehmer eine entsprechende Nachricht verschickt.

Somit endet Der Prozess

**Schritte zum Ausführen:**

- external_task_client/emailConfig.yaml muss mit Email Zugangsdaten Konfiguriert werden
- `docker-compose up` im Root-Directory
- Warten bis `Camunda engine has started. Subscribing to tasks...` im Log erscheint
- Camunda Benutzeroberfläche läuft unter `localhost:8080`. Username und Password sind jeweils `demo`
- Zum Starten einer Prozessintanz muss ein REST Request folgender form verschickt werden: <br>
```
curl --location 'http://localhost:8080/engine-rest/process-definition/key/insuranceClaim/start' \
--header 'Content-Type: application/json' \
--data-raw '{
    "variables": {
        "claimData": {
            "value": "{\"policyHolder\":{\"fullName\":\"Kyrylo Zakurdaiev\",\"dob\":\"27-01-1997\",\"address\":\"Musterstraße 123, Stadtstadt, Bundesland\",\"contactNumber\":\"+49123456789\",\"email\":\"kyrylo.zakurdaiev@l21s.de\"},\"incident\":{\"date\":\"05-03-2024\",\"location\":\"Eichenweg 12, Stadtstadt, Bundesland\",\"description\":\"Autounfall auf dem Weg zur Arbeit\"},\"damageDetails\":{\"estimatedCost\":6000.00,\"description\":\"Beschädigung der vorderen Stoßstange und des linken Scheinwerfers\",\"photos\":[\"https://example.de/foto1.jpg\",\"https://example.de/foto2.jpg\"]}}",
            "type": "json"
        }
    }
}'
```
- Die User Tasks werden unter `http://localhost:8080/camunda/app/tasklist/` erledigt, Ausführung der Service Tasks kann man in den Logs nachfolgen.
- Alle Prozessinstanzen kann man unter `localhost:8081` einsehen.


**Weitere Infos:**

- die Oben erwähnten Embedded Camunda Engine sowie Java Delegate Pattern werden nicht mehr von Camunda empfohlen, siehe [Blogpost](https://blog.bernd-ruecker.com/moving-from-embedded-to-remote-workflow-engines-8472992cc371). Da es immer noch ein verbreitetes Pattern ist (insb. bei L21s Kunden), haben wir den hier zum Demonstrationzweck implementiert
