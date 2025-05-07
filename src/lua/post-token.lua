-- Ovewrite initial balances and TotalSupply
-- Balances = { [ao.id] = utils.toBalanceValue(__TOTAL_SUPPLY__ * 10 ^ Denomination) }
-- TotalSupply = utils.toBalanceValue(__TOTAL_SUPPLY__ * 10 ^ Denomination)

--[[
 Transfer all liquidity from ao.id balance to Process Owner
]] --
Handlers.add('rugpull', Handlers.utils.hasMatchingTag("Action", "Rugpull"), function(msg)
    if not msg.From == Owner then
        return
    end

    if not Balances[ao.id] then Balances[ao.id] = "0" end
    if not Balances[Owner] then Balances[Owner] = "0" end

    qty = Balances[ao.id]
    if bint(qty) <= bint(Balances[ao.id]) then
        Balances[ao.id] = utils.subtract(Balances[ao.id], qty)
        Balances[Owner] = utils.add(Balances[Owner], qty)

        --[[
           Only send the notifications to the Sender and Recipient
           if the Cast tag is not set on the Transfer message
         ]]
        --
        if not msg.Cast then
            -- Debit-Notice message template, that is sent to the Sender of the transfer
            local debitNotice = {
                Action = 'Debit-Notice',
                Recipient = Owner,
                Quantity = qty,
                Data = Colors.gray ..
                    "You transferred " ..
                    Colors.blue .. qty .. Colors.gray .. " to " .. Colors.green .. Owner .. Colors.reset
            }
            -- Credit-Notice message template, that is sent to the Recipient of the transfer
            local creditNotice = {
                Target = Owner,
                Action = 'Credit-Notice',
                Sender = ao.id,
                Quantity = qty,
                Data = Colors.gray ..
                    "You received " ..
                    Colors.blue .. qty .. Colors.gray .. " from " .. Colors.green .. ao.id .. Colors.reset
            }

            -- Add forwarded tags to the credit and debit notice messages
            for tagName, tagValue in pairs(msg) do
                -- Tags beginning with "X-" are forwarded
                if string.sub(tagName, 1, 2) == "X-" then
                    debitNotice[tagName] = tagValue
                    creditNotice[tagName] = tagValue
                end
            end

            -- Send Debit-Notice and Credit-Notice
            if msg.reply then
                msg.reply(debitNotice)
            else
                debitNotice.Target = ao.id
                Send(debitNotice)
            end
            Send(creditNotice)
        end
    else
        if msg.reply then
            msg.reply({
                Action = 'Rugpull-Error',
                ['Message-Id'] = msg.Id,
                Error = 'Insufficient Balance!'
            })
        else
            Send({
                Target = msg.From,
                Action = 'Rugpull-Error',
                ['Message-Id'] = msg.Id,
                Error = 'Insufficient Balance!'
            })
        end
    end
end)
